import { ApiError, apiFetch, readJsonSafe, toApiError } from './api.js'

const IN_FLIGHT = new Set(['pending', 'running'])

/**
 * @param {string | null | undefined} status
 */
export function shopifySyncStatusLabel(status) {
  switch (status) {
    case 'pending':
      return 'Queued'
    case 'running':
      return 'Syncing'
    case 'succeeded':
      return 'Succeeded'
    case 'failed':
      return 'Failed'
    case 'partial':
      return 'Partial'
    case null:
    case undefined:
    case '':
      return 'Never synced'
    default:
      return status
  }
}

/**
 * @param {string | null | undefined} status
 */
export function shopifySyncStatusTone(status) {
  switch (status) {
    case 'succeeded':
      return 'success'
    case 'pending':
    case 'running':
      return 'warning'
    case 'failed':
      return 'danger'
    case 'partial':
      return 'warning'
    default:
      return 'neutral'
  }
}

/**
 * @param {{ summary?: { status?: string | null } | null, latest_run?: { status?: string | null } | null } | null | undefined} payload
 */
export function isShopifySyncInFlight(payload) {
  const status = payload?.latest_run?.status ?? payload?.summary?.status ?? null
  return typeof status === 'string' && IN_FLIGHT.has(status)
}

/**
 * GET /api/v1/stores/{store}/shopify/sync
 *
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<{
 *   summary: object,
 *   latest_run: object | null,
 *   counts: { customer_identities: number, products: number, orders: number }
 * }>}
 */
export async function getShopifyCommerceSync(storeId, deps = {}) {
  if (!storeId) {
    throw new ApiError('A store is required to load Shopify sync status.', { status: 422 })
  }

  const response = await apiFetch(
    `/api/v1/stores/${encodeURIComponent(storeId)}/shopify/sync`,
    { method: 'GET' },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to load Shopify sync status.')
  }

  const payload = await readJsonSafe(response)
  const data = payload?.data
  if (!data || typeof data !== 'object') {
    throw new ApiError('Invalid Shopify sync status response.', {
      status: response.status,
      body: payload,
    })
  }

  const counts = data.counts && typeof data.counts === 'object' ? data.counts : {}
  return {
    summary: data.summary && typeof data.summary === 'object' ? data.summary : {},
    latest_run: data.latest_run && typeof data.latest_run === 'object' ? data.latest_run : null,
    counts: {
      customer_identities: Number(counts.customer_identities) || 0,
      products: Number(counts.products) || 0,
      orders: Number(counts.orders) || 0,
    },
  }
}

/**
 * POST /api/v1/stores/{store}/shopify/sync
 *
 * @param {string} storeId
 * @param {{ resources?: string[] }} [body]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function startShopifyCommerceSync(storeId, body = {}, deps = {}) {
  if (!storeId) {
    throw new ApiError('A store is required to start Shopify sync.', { status: 422 })
  }

  const payload = {}
  if (Array.isArray(body.resources) && body.resources.length > 0) {
    payload.resources = body.resources
  }

  const response = await apiFetch(
    `/api/v1/stores/${encodeURIComponent(storeId)}/shopify/sync`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to start Shopify commerce sync.')
  }

  const json = await readJsonSafe(response)
  const run = json?.data
  if (!run || typeof run !== 'object' || !run.id) {
    throw new ApiError('Invalid Shopify sync start response.', {
      status: response.status,
      body: json,
    })
  }

  return run
}
