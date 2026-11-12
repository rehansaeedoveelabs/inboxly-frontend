import { ApiError } from './api.js'
import { requireStoreId, storeAudiencePath, audienceFetch, readAudienceJson, assertAudienceOk } from './audienceApi.js'

/**
 * Build the relative Meta OAuth start path. Store id must be a backend ULID.
 *
 * @param {string} storeId
 */
export function metaOAuthStartPath(storeId) {
  if (!storeId || typeof storeId !== 'string') {
    throw new ApiError('A store must be selected before connecting Meta.', { status: 422 })
  }

  return `/api/v1/stores/${encodeURIComponent(storeId)}/meta/oauth/start`
}

/**
 * Start Meta OAuth via full-page navigation (same pattern as Shopify).
 *
 * @param {{
 *   storeId: string,
 *   assignLocation?: (url: string) => void,
 * }} options
 */
export async function startMetaOAuth(options) {
  const assignLocation =
    options.assignLocation ??
    ((url) => {
      window.location.assign(url)
    })

  const path = metaOAuthStartPath(options.storeId)
  assignLocation(path)

  return { navigated: true, path }
}

/**
 * GET /api/v1/stores/{store}/meta/connection
 *
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getMetaConnection(storeId, deps = {}) {
  const id = requireStoreId(storeId)
  const path = storeAudiencePath(id, 'meta/connection')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load Meta connection.')
  const result = await readAudienceJson(response)
  const data = result?.data
  if (!data || typeof data !== 'object') {
    throw new ApiError('Invalid Meta connection response.', { status: response.status, body: result })
  }
  return data
}

/**
 * DELETE /api/v1/stores/{store}/meta/connection
 *
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function disconnectMetaConnection(storeId, deps = {}) {
  const id = requireStoreId(storeId)
  const path = storeAudiencePath(id, 'meta/connection')
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to disconnect Meta.')
  const result = await readAudienceJson(response)
  return result?.data ?? { disconnected: true }
}

/**
 * GET /api/v1/stores/{store}/meta/pages/discover
 * Returns safe Page metadata only (never tokens).
 *
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function discoverMetaPages(storeId, deps = {}) {
  const id = requireStoreId(storeId)
  const path = storeAudiencePath(id, 'meta/pages/discover')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to discover Facebook Pages.')
  const result = await readAudienceJson(response)
  const pages = result?.data?.pages
  if (!Array.isArray(pages)) {
    throw new ApiError('Invalid Meta Pages discovery response.', { status: response.status, body: result })
  }
  return pages
}

/**
 * POST /api/v1/stores/{store}/meta/pages/select
 *
 * @param {string} storeId
 * @param {{ pageIds: string[], defaultPageId?: string | null }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function selectMetaPages(storeId, payload, deps = {}) {
  const id = requireStoreId(storeId)
  const path = storeAudiencePath(id, 'meta/pages/select')
  const body = {
    page_ids: Array.isArray(payload.pageIds) ? payload.pageIds : [],
  }
  if (typeof payload.defaultPageId === 'string' && payload.defaultPageId !== '') {
    body.default_page_id = payload.defaultPageId
  }
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to select Facebook Pages.')
  const result = await readAudienceJson(response)
  if (!Array.isArray(result?.data)) {
    throw new ApiError('Invalid Meta Page selection response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * PUT /api/v1/stores/{store}/meta/pages/{page}/default
 *
 * @param {string} storeId
 * @param {string} pageRowId Inboxly ULID for the selected page row
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function setDefaultMetaPage(storeId, pageRowId, deps = {}) {
  const id = requireStoreId(storeId)
  if (!pageRowId) {
    throw new ApiError('A selected Page is required.', { status: 422 })
  }
  const path = storeAudiencePath(id, `meta/pages/${pageRowId}/default`)
  const response = await audienceFetch(path, { method: 'PUT' }, deps)
  await assertAudienceOk(response, 'Unable to set the default Facebook Page.')
  const result = await readAudienceJson(response)
  if (!result?.data?.id) {
    throw new ApiError('Invalid default Page response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * DELETE /api/v1/stores/{store}/meta/pages/{page}
 *
 * @param {string} storeId
 * @param {string} pageRowId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function removeMetaPage(storeId, pageRowId, deps = {}) {
  const id = requireStoreId(storeId)
  if (!pageRowId) {
    throw new ApiError('A selected Page is required.', { status: 422 })
  }
  const path = storeAudiencePath(id, `meta/pages/${pageRowId}`)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to remove the Facebook Page.')
  return true
}
