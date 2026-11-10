import { ApiError, apiFetch, readJsonSafe } from './api.js'

/**
 * @param {string | null | undefined} domain
 */
export function normalizeShopDomain(domain) {
  if (!domain || typeof domain !== 'string') return null
  let value = domain.trim().toLowerCase()
  value = value.replace(/^https?:\/\//, '')
  value = value.split('/')[0] ?? value
  return value || null
}

/**
 * Build the relative OAuth start path. Store id must be a backend ULID.
 * @param {string} storeId
 * @param {string | null} [shopDomain]
 */
export function shopifyOAuthStartPath(storeId, shopDomain = null) {
  if (!storeId || typeof storeId !== 'string') {
    throw new ApiError('A store must be selected before connecting Shopify.', { status: 422 })
  }

  const path = `/api/v1/stores/${encodeURIComponent(storeId)}/shopify/oauth/start`
  const shop = normalizeShopDomain(shopDomain)
  if (!shop) return path
  return `${path}?${new URLSearchParams({ shop }).toString()}`
}

/**
 * Resolve a real Inboxly store ULID from the authenticated API.
 * Prefer workspace active_store_id; otherwise match the selected storefront domain.
 * Never uses mock store ids.
 *
 * @param {{
 *   selectedDomain?: string | null,
 *   apiFetchFn?: typeof apiFetch,
 * }} [options]
 * @returns {Promise<{ storeId: string, shopDomain: string | null }>}
 */
export async function resolveBackendStoreForOAuth(options = {}) {
  const fetchApi = options.apiFetchFn ?? apiFetch
  const selectedDomain = normalizeShopDomain(options.selectedDomain)

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
    return {
      storeId: String(withActive.active_store_id),
      shopDomain: selectedDomain,
    }
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

  const matched = selectedDomain
    ? stores.find(
        (store) =>
          normalizeShopDomain(store.domain) === selectedDomain ||
          normalizeShopDomain(store.shopify_shop_domain) === selectedDomain,
      )
    : null

  const store =
    matched ??
    stores.find((item) => item.connection_status === 'pending') ??
    stores[0]

  return {
    storeId: String(store.id),
    shopDomain: normalizeShopDomain(store.domain) ?? selectedDomain,
  }
}

/**
 * Start Shopify OAuth via Laravel.
 *
 * Laravel's start endpoint responds with HTTP 302 to Shopify. Browser Fetch cannot
 * reliably expose that Location (opaque redirect), so after resolving a backend
 * store ULID we navigate the browser to the same-origin start URL. The Sanctum
 * session cookie is sent automatically; Laravel then redirects to Shopify.
 *
 * This does not mean the store is connected — connection completes only after the
 * OAuth callback succeeds.
 *
 * @param {{
 *   selectedDomain?: string | null,
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

  const { storeId, shopDomain } = await resolveBackendStoreForOAuth({
    selectedDomain: options.selectedDomain,
    apiFetchFn: fetchApi,
  })

  const path = shopifyOAuthStartPath(storeId, shopDomain)
  assignLocation(path)

  return { navigated: true, path }
}
