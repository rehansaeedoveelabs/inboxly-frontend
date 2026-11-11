import { ApiError, apiFetch, readJsonSafe } from './api.js'

/**
 * @param {string | null | undefined} domain
 */
export function normalizeShopDomain(domain) {
  if (!domain || typeof domain !== 'string') return null
  let value = domain.trim().toLowerCase()
  value = value.replace(/^https?:\/\//, '')
  value = value.split('/')[0] ?? value
  value = value.split('?')[0] ?? value
  return value || null
}

/**
 * Build the relative OAuth start path. Store id must be a backend ULID.
 * Never appends ?shop= — Laravel uses the persisted store domain.
 *
 * @param {string} storeId
 */
export function shopifyOAuthStartPath(storeId) {
  if (!storeId || typeof storeId !== 'string') {
    throw new ApiError('A store must be selected before connecting Shopify.', { status: 422 })
  }

  return `/api/v1/stores/${encodeURIComponent(storeId)}/shopify/oauth/start`
}

/**
 * Resolve a real Inboxly store ULID for OAuth.
 * Prefer an explicit storeId, then workspace active_store_id, then a pending store.
 * Never uses mock store ids and never returns a client shop override.
 *
 * @param {{
 *   storeId?: string | null,
 *   apiFetchFn?: typeof apiFetch,
 * }} [options]
 * @returns {Promise<{ storeId: string }>}
 */
export async function resolveBackendStoreForOAuth(options = {}) {
  if (options.storeId) {
    return { storeId: String(options.storeId) }
  }

  const fetchApi = options.apiFetchFn ?? apiFetch

  let meResponse
  try {
    meResponse = await fetchApi('/api/v1/auth/me', { method: 'GET' })
  } catch {
    throw new ApiError('Network error while preparing Shopify connection.', { status: 0 })
  }

  if (meResponse.status === 401) {
    throw new ApiError('Sign in to Inboxly before connecting Shopify.', { status: 401 })
  }
  if (!meResponse.ok) {
    throw new ApiError('Could not load your Inboxly account.', {
      status: meResponse.status,
      body: await readJsonSafe(meResponse),
    })
  }

  const mePayload = await readJsonSafe(meResponse)
  const workspaces = mePayload?.data?.workspaces ?? []
  if (!Array.isArray(workspaces) || workspaces.length === 0) {
    throw new ApiError('Create a workspace before connecting Shopify.', { status: 422 })
  }

  const withActive = workspaces.find((workspace) => workspace.active_store_id)
  if (withActive?.active_store_id) {
    return { storeId: String(withActive.active_store_id) }
  }

  const workspace = workspaces[0]
  let storesResponse
  try {
    storesResponse = await fetchApi(
      `/api/v1/workspaces/${encodeURIComponent(workspace.id)}/stores`,
      { method: 'GET' },
    )
  } catch {
    throw new ApiError('Network error while loading workspace stores.', { status: 0 })
  }

  if (storesResponse.status === 401) {
    throw new ApiError('Sign in to Inboxly before connecting Shopify.', { status: 401 })
  }
  if (storesResponse.status === 403) {
    throw new ApiError('You are not allowed to view stores in this workspace.', { status: 403 })
  }
  if (!storesResponse.ok) {
    throw new ApiError('Could not load workspace stores.', {
      status: storesResponse.status,
      body: await readJsonSafe(storesResponse),
    })
  }

  const storesPayload = await readJsonSafe(storesResponse)
  const stores = storesPayload?.data ?? []
  if (!Array.isArray(stores) || stores.length === 0) {
    throw new ApiError('Create an Inboxly store before connecting Shopify.', { status: 422 })
  }

  const store =
    stores.find((item) => item.connection_status === 'pending' && !item.is_demo) ??
    stores.find((item) => !item.is_demo) ??
    stores[0]

  return { storeId: String(store.id) }
}

/**
 * Start Shopify OAuth via Laravel using a persisted store ULID only.
 *
 * @param {{
 *   storeId?: string | null,
 *   apiFetchFn?: typeof apiFetch,
 *   assignLocation?: (url: string) => void,
 * }} [options]
 */
export async function startShopifyOAuth(options = {}) {
  const fetchApi = options.apiFetchFn ?? apiFetch
  const assignLocation =
    options.assignLocation ??
    ((url) => {
      window.location.assign(url)
    })

  const { storeId } = await resolveBackendStoreForOAuth({
    storeId: options.storeId,
    apiFetchFn: fetchApi,
  })

  const path = shopifyOAuthStartPath(storeId)
  assignLocation(path)

  return { navigated: true, path }
}
