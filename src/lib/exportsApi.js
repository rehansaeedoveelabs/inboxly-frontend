import { ApiError, toApiError } from './api.js'
import {
  assertAudienceOk,
  audienceFetch,
  audienceResourcePath,
  buildAudienceQuery,
  readAudienceCursorPage,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * Contact exports — Laravel ContactExportController.
 *
 * Start:    POST /api/v1/stores/{store}/contact-exports → 202 { data }
 * List:     GET  /api/v1/stores/{store}/contact-exports?cursor=&limit=
 * Show:     GET  /api/v1/contact-exports/{id}
 * Download: GET  /api/v1/contact-exports/{id}/download (CSV stream)
 *
 * Filters on start: q, tag, consent_email (optional).
 * Resource never includes path/disk — use download_available.
 */

const TERMINAL = new Set(['completed', 'failed'])

/**
 * @param {string | null | undefined} exportId
 * @returns {string}
 */
function requireExportId(exportId) {
  if (typeof exportId !== 'string' || exportId.trim() === '') {
    throw new ApiError('An export id is required.', { status: 422 })
  }
  return exportId.trim()
}

/**
 * @param {{
 *   q?: string | null,
 *   tag?: string | null,
 *   consent_email?: string | null,
 * }} [filters]
 */
function exportFilterBody(filters = {}) {
  const body = {}
  if (typeof filters.q === 'string' && filters.q.trim() !== '') {
    body.q = filters.q.trim()
  }
  if (typeof filters.tag === 'string' && filters.tag.trim() !== '') {
    body.tag = filters.tag.trim()
  }
  if (typeof filters.consent_email === 'string' && filters.consent_email.trim() !== '') {
    body.consent_email = filters.consent_email.trim()
  }
  return body
}

/**
 * POST /api/v1/stores/{store}/contact-exports
 *
 * @param {string} storeId
 * @param {{
 *   q?: string | null,
 *   tag?: string | null,
 *   consent_email?: string | null,
 * }} [filters]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function startContactExport(storeId, filters = {}, deps = {}) {
  const path = storeAudiencePath(storeId, 'contact-exports')
  const body = exportFilterBody(filters)
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to start the export.')
  return readAudienceResource(response, 'contact export')
}

/**
 * GET /api/v1/stores/{store}/contact-exports
 *
 * @param {string} storeId
 * @param {{ cursor?: string | null, limit?: number }} [params]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function listStoreContactExports(storeId, params = {}, deps = {}) {
  const query = buildAudienceQuery({
    cursor: params.cursor,
    limit: params.limit ?? 25,
  })
  const path = `${storeAudiencePath(storeId, 'contact-exports')}${query}`
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load exports.')
  return readAudienceCursorPage(response)
}

/**
 * GET /api/v1/contact-exports/{id}
 *
 * @param {string} exportId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getContactExport(exportId, deps = {}) {
  const id = requireExportId(exportId)
  const path = audienceResourcePath('contact-exports', id)
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the export.')
  return readAudienceResource(response, 'contact export')
}

/**
 * @param {string | null | undefined} status
 */
export function isExportTerminal(status) {
  return TERMINAL.has(String(status || ''))
}

/**
 * True when the API says a download is available (completed, unexpired, file present).
 * @param {{ download_available?: boolean } | null | undefined} exportRecord
 */
export function canDownloadExport(exportRecord) {
  return Boolean(exportRecord?.download_available)
}

/**
 * Client-side expired hint from expires_at (download still uses API truth).
 * @param {{ expires_at?: string | null } | null | undefined} exportRecord
 */
export function isExportExpired(exportRecord) {
  const raw = exportRecord?.expires_at
  if (!raw) return false
  const expires = new Date(raw)
  if (Number.isNaN(expires.getTime())) return false
  return expires.getTime() <= Date.now()
}

/**
 * Safe download filename from Content-Disposition or resource field.
 * @param {string | null | undefined} headerValue
 * @param {string | null | undefined} fallback
 */
export function resolveExportFilename(headerValue, fallback = 'contacts-export.csv') {
  const fromHeader = parseContentDispositionFilename(headerValue)
  if (fromHeader) return fromHeader
  if (typeof fallback === 'string' && fallback.trim() !== '') {
    return sanitizeFilename(fallback.trim())
  }
  return 'contacts-export.csv'
}

/**
 * @param {string | null | undefined} headerValue
 */
function parseContentDispositionFilename(headerValue) {
  if (typeof headerValue !== 'string' || headerValue === '') return null
  const utf8 = headerValue.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8?.[1]) {
    try {
      return sanitizeFilename(decodeURIComponent(utf8[1].trim()))
    } catch {
      // fall through
    }
  }
  const plain = headerValue.match(/filename="([^"]+)"/i) || headerValue.match(/filename=([^;]+)/i)
  if (plain?.[1]) return sanitizeFilename(plain[1].trim())
  return null
}

/**
 * @param {string} name
 */
function sanitizeFilename(name) {
  const cleaned = name.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'contacts-export.csv'
  return cleaned.toLowerCase().endsWith('.csv') ? cleaned : `${cleaned}.csv`
}

/**
 * GET download — returns blob + filename. Uses Sanctum cookies (no public URLs).
 *
 * @param {string} exportId
 * @param {{
 *   filenameHint?: string | null,
 *   fetchFn?: typeof fetch,
 *   cookieString?: string,
 * }} [options]
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function downloadContactExport(exportId, options = {}) {
  const id = requireExportId(exportId)
  const deps = { fetchFn: options.fetchFn, cookieString: options.cookieString }
  const path = audienceResourcePath('contact-exports', id, 'download')
  const response = await audienceFetch(
    path,
    {
      method: 'GET',
      headers: {
        Accept: 'text/csv, application/json',
      },
    },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to download the export.')
  }

  const filename = resolveExportFilename(
    response.headers.get('Content-Disposition'),
    options.filenameHint,
  )
  const blob = await response.blob()
  return { blob, filename }
}

/**
 * Trigger a browser file save for a blob (DOM only).
 * @param {Blob} blob
 * @param {string} filename
 */
export function saveBlobAsFile(blob, filename) {
  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    throw new ApiError('File download is only available in the browser.', { status: 500 })
  }
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * Poll until completed/failed or attempts exhausted.
 *
 * @param {string} exportId
 * @param {{
 *   intervalMs?: number,
 *   maxAttempts?: number,
 *   fetchFn?: typeof fetch,
 *   cookieString?: string,
 *   sleepFn?: (ms: number) => Promise<void>,
 * }} [options]
 */
export async function pollContactExport(exportId, options = {}) {
  const intervalMs = options.intervalMs ?? 2000
  const maxAttempts = options.maxAttempts ?? 90
  const sleepFn =
    options.sleepFn ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  const deps = { fetchFn: options.fetchFn, cookieString: options.cookieString }

  let last = await getContactExport(exportId, deps)
  if (isExportTerminal(last.status)) return last

  for (let attempt = 1; attempt < maxAttempts; attempt += 1) {
    await sleepFn(intervalMs)
    last = await getContactExport(exportId, deps)
    if (isExportTerminal(last.status)) return last
  }

  return last
}

/**
 * Summarize applied filters for history display (no PII beyond filter strings).
 * @param {Record<string, unknown> | null | undefined} filters
 */
export function formatExportFilters(filters) {
  if (!filters || typeof filters !== 'object') return 'All contacts'
  const parts = []
  if (typeof filters.q === 'string' && filters.q !== '') parts.push(`Search: ${filters.q}`)
  if (typeof filters.tag === 'string' && filters.tag !== '') parts.push(`Tag: ${filters.tag}`)
  if (typeof filters.consent_email === 'string' && filters.consent_email !== '') {
    parts.push(`Email consent: ${filters.consent_email}`)
  }
  return parts.length > 0 ? parts.join(' · ') : 'All contacts'
}
