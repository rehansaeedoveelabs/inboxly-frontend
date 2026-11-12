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
 * Store assets — Laravel AssetController.
 *
 * List/upload: GET|POST /api/v1/stores/{store}/assets
 * Show/delete: GET|DELETE /api/v1/assets/{id}
 * Download:    GET /api/v1/assets/{id}/download (private disk stream)
 *
 * Resource never includes path/disk.
 */

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
export const ASSET_MAX_BYTES = 5_242_880

/**
 * @param {string | null | undefined} assetId
 * @returns {string}
 */
function requireAssetId(assetId) {
  if (typeof assetId !== 'string' || assetId.trim() === '') {
    throw new ApiError('An asset id is required.', { status: 422 })
  }
  return assetId.trim()
}

/**
 * @param {File | null | undefined} file
 * @returns {string | null}
 */
export function validateAssetFile(file) {
  if (!file) return 'Choose an image file.'
  if (!ALLOWED_MIMES.has(file.type)) {
    return 'Only JPEG, PNG, GIF, and WebP images are supported.'
  }
  if (typeof file.size === 'number' && file.size > ASSET_MAX_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

/**
 * GET /api/v1/stores/{store}/assets
 *
 * @param {string} storeId
 * @param {{ q?: string | null, cursor?: string | null, limit?: number }} [params]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function listStoreAssets(storeId, params = {}, deps = {}) {
  const query = buildAudienceQuery({
    q: params.q,
    cursor: params.cursor,
    limit: params.limit ?? 25,
  })
  const path = `${storeAudiencePath(storeId, 'assets')}${query}`
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load assets.')
  return readAudienceCursorPage(response)
}

/**
 * POST /api/v1/stores/{store}/assets (multipart)
 *
 * @param {string} storeId
 * @param {{ file: File, alt?: string | null }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function uploadStoreAsset(storeId, payload, deps = {}) {
  const fileError = validateAssetFile(payload?.file)
  if (fileError) {
    throw new ApiError(fileError, { status: 422, errors: { file: [fileError] } })
  }

  const form = new FormData()
  form.append('file', payload.file)
  if (typeof payload.alt === 'string' && payload.alt.trim() !== '') {
    form.append('alt', payload.alt.trim())
  }

  const path = storeAudiencePath(storeId, 'assets')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      body: form,
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to upload the asset.')
  return readAudienceResource(response, 'asset')
}

/**
 * GET /api/v1/assets/{id}
 *
 * @param {string} assetId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getAsset(assetId, deps = {}) {
  const id = requireAssetId(assetId)
  const path = audienceResourcePath('assets', id)
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the asset.')
  return readAudienceResource(response, 'asset')
}

/**
 * DELETE /api/v1/assets/{id}
 *
 * @param {string} assetId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function deleteAsset(assetId, deps = {}) {
  const id = requireAssetId(assetId)
  const path = audienceResourcePath('assets', id)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to delete the asset.')
}

/**
 * GET /api/v1/assets/{id}/download → blob for authenticated preview/save.
 *
 * @param {string} assetId
 * @param {{
 *   filenameHint?: string | null,
 *   fetchFn?: typeof fetch,
 *   cookieString?: string,
 * }} [options]
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function downloadAsset(assetId, options = {}) {
  const id = requireAssetId(assetId)
  const deps = { fetchFn: options.fetchFn, cookieString: options.cookieString }
  const path = audienceResourcePath('assets', id, 'download')
  const response = await audienceFetch(
    path,
    {
      method: 'GET',
      headers: { Accept: 'image/*,application/octet-stream,application/json' },
    },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to download the asset.')
  }

  const header = response.headers.get('Content-Disposition') || ''
  const match = header.match(/filename="([^"]+)"/i) || header.match(/filename=([^;]+)/i)
  const filename =
    (match?.[1] && match[1].trim()) ||
    (typeof options.filenameHint === 'string' && options.filenameHint.trim()) ||
    'asset'
  const blob = await response.blob()
  return { blob, filename }
}

/**
 * @param {{ byte_size?: number | null, width?: number | null, height?: number | null }} asset
 */
export function formatAssetMeta(asset) {
  const parts = []
  if (asset?.width && asset?.height) {
    parts.push(`${asset.width}×${asset.height}`)
  }
  if (typeof asset?.byte_size === 'number') {
    const kb = Math.max(1, Math.round(asset.byte_size / 1024))
    parts.push(`${kb} KB`)
  }
  return parts.length ? parts.join(' · ') : '—'
}
