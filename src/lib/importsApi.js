import { ApiError } from './api.js'
import {
  assertAudienceOk,
  audienceFetch,
  audienceResourcePath,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * Contact imports — Laravel ContactImportController.
 *
 * Start: POST /api/v1/stores/{store}/contact-imports → 202 { data: ContactImportResource }
 * Poll:  GET /api/v1/contact-imports/{contactImport}
 *
 * There is no list/index endpoint — callers keep session history of started imports.
 */

const TERMINAL = new Set(['completed', 'failed'])

/**
 * @param {string} storeId
 * @param {{
 *   rows: Array<Record<string, unknown>>,
 *   tags?: string[],
 *   filename?: string | null,
 * }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function startContactImport(storeId, payload, deps = {}) {
  const path = storeAudiencePath(storeId, 'contact-imports')
  const body = {
    rows: payload.rows,
  }
  if (payload.tags !== undefined) body.tags = payload.tags
  if (payload.filename !== undefined) body.filename = payload.filename

  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to start the import.')
  return readAudienceResource(response, 'contact import')
}

/**
 * @param {string} importId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getContactImport(importId, deps = {}) {
  if (typeof importId !== 'string' || importId.trim() === '') {
    throw new ApiError('An import id is required.', { status: 422 })
  }
  const path = audienceResourcePath('contact-imports', importId.trim())
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the import.')
  return readAudienceResource(response, 'contact import')
}

/**
 * @param {string | null | undefined} status
 */
export function isImportTerminal(status) {
  return TERMINAL.has(String(status || ''))
}

/**
 * Poll until completed/failed or attempts exhausted.
 *
 * @param {string} importId
 * @param {{
 *   intervalMs?: number,
 *   maxAttempts?: number,
 *   fetchFn?: typeof fetch,
 *   cookieString?: string,
 *   sleepFn?: (ms: number) => Promise<void>,
 * }} [options]
 */
export async function pollContactImport(importId, options = {}) {
  const intervalMs = options.intervalMs ?? 1500
  const maxAttempts = options.maxAttempts ?? 40
  const sleepFn =
    options.sleepFn ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  const deps = { fetchFn: options.fetchFn, cookieString: options.cookieString }

  let last = await getContactImport(importId, deps)
  if (isImportTerminal(last.status)) return last

  for (let attempt = 1; attempt < maxAttempts; attempt += 1) {
    await sleepFn(intervalMs)
    last = await getContactImport(importId, deps)
    if (isImportTerminal(last.status)) return last
  }

  return last
}
