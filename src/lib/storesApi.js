import { ApiError, apiFetch, readJsonSafe, toApiError } from './api.js'

/**
 * @param {Response} response
 */
async function readStore(response) {
  const payload = await readJsonSafe(response)
  const store = payload?.data
  if (!store || typeof store !== 'object' || !store.id) {
    throw new ApiError('Invalid store response.', { status: response.status, body: payload })
  }
  return store
}

/**
 * @param {string} workspaceId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<object[]>}
 */
export async function listWorkspaceStores(workspaceId, deps = {}) {
  if (!workspaceId) {
    throw new ApiError('A workspace is required to load stores.', { status: 422 })
  }

  const response = await apiFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/stores`,
    { method: 'GET' },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to load workspace stores.')
  }

  const payload = await readJsonSafe(response)
  const stores = payload?.data
  if (!Array.isArray(stores)) {
    throw new ApiError('Invalid stores list response.', { status: response.status, body: payload })
  }
  return stores
}

/**
 * Create a real (non-demo) pending store.
 * Contract: POST /api/v1/workspaces/{workspace}/stores
 * Body: { name, domain } — never sends is_demo.
 *
 * @param {string} workspaceId
 * @param {{ name: string, domain: string }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function createWorkspaceStore(workspaceId, payload, deps = {}) {
  if (!workspaceId) {
    throw new ApiError('A workspace is required to create a store.', { status: 422 })
  }

  const response = await apiFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/stores`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        domain: payload.domain,
      }),
    },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to create the store.')
  }

  return readStore(response)
}

/**
 * Disconnect Shopify for a store (Admin only).
 * Contract: DELETE /api/v1/stores/{store}/shopify/connection
 * → { data: StoreResource, meta: { remote_revoked: boolean } }
 *
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<{ store: object, remote_revoked: boolean, meta: object }>}
 */
export async function disconnectShopifyStore(storeId, deps = {}) {
  if (!storeId) {
    throw new ApiError('A store is required to disconnect Shopify.', { status: 422 })
  }

  const response = await apiFetch(
    `/api/v1/stores/${encodeURIComponent(storeId)}/shopify/connection`,
    { method: 'DELETE' },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to disconnect Shopify.')
  }

  const payload = await readJsonSafe(response)
  const store = payload?.data
  if (!store || typeof store !== 'object' || !store.id) {
    throw new ApiError('Invalid disconnect response.', { status: response.status, body: payload })
  }

  const meta = payload?.meta && typeof payload.meta === 'object' ? payload.meta : {}
  const remote_revoked = meta.remote_revoked === true

  return { store, remote_revoked, meta }
}

/**
 * Activate a store for the current user context.
 * Contract: POST /api/v1/stores/{store}/activate → ContextResource
 *
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function activateStore(storeId, deps = {}) {
  if (!storeId) {
    throw new ApiError('A store is required to activate.', { status: 422 })
  }

  const response = await apiFetch(
    `/api/v1/stores/${encodeURIComponent(storeId)}/activate`,
    { method: 'POST' },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to activate the store.')
  }

  const payload = await readJsonSafe(response)
  const context = payload?.data
  if (!context || typeof context !== 'object') {
    throw new ApiError('Invalid activation response.', { status: response.status, body: payload })
  }
  return context
}

/**
 * @param {string | null | undefined} status
 */
export function storeStatusLabel(status) {
  switch (status) {
    case 'connected':
      return 'Connected'
    case 'pending':
      return 'Pending connection'
    case 'disconnected':
      return 'Disconnected'
    case 'error':
      return 'Connection error'
    case 'demo':
      return 'Demo'
    default:
      return status || 'Unknown'
  }
}

/**
 * @param {string | null | undefined} status
 */
export function storeStatusTone(status) {
  switch (status) {
    case 'connected':
      return 'success'
    case 'pending':
      return 'warning'
    case 'error':
      return 'danger'
    case 'demo':
      return 'neutral'
    default:
      return 'neutral'
  }
}
