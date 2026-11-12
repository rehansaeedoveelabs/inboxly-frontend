/**
 * Readable labels for Shopify Admin API scopes Inboxly may request.
 * Never imply protected customer data approval from these commerce scopes.
 */
export const SHOPIFY_SCOPE_LABELS = Object.freeze({
  read_customers: 'Read customers',
  read_products: 'Read products',
  read_orders: 'Read orders',
  read_all_orders: 'Read all historical orders',
})

/**
 * @param {unknown} scopes
 * @returns {string[]}
 */
export function normalizeShopifyScopes(scopes) {
  if (!Array.isArray(scopes)) return []
  return scopes
    .filter((scope) => typeof scope === 'string')
    .map((scope) => scope.trim())
    .filter(Boolean)
}

/**
 * @param {string} scope
 */
export function shopifyScopeLabel(scope) {
  if (typeof scope !== 'string' || scope.trim() === '') return 'Unknown permission'
  const key = scope.trim()
  return SHOPIFY_SCOPE_LABELS[key] ?? key
}

/**
 * @param {unknown} scopes
 * @returns {{ handle: string, label: string }[]}
 */
export function describeShopifyScopes(scopes) {
  return normalizeShopifyScopes(scopes).map((handle) => ({
    handle,
    label: shopifyScopeLabel(handle),
  }))
}

/**
 * Historical order access requires both read_orders and read_all_orders.
 * Never claim it from either scope alone.
 *
 * @param {{ shopify_scopes?: unknown } | null | undefined} store
 */
export function hasHistoricalOrderAccess(store) {
  const granted = normalizeShopifyScopes(store?.shopify_scopes)
  return granted.includes('read_orders') && granted.includes('read_all_orders')
}

/**
 * @param {{
 *   is_connected?: boolean,
 *   requires_shopify_reauth?: boolean,
 *   missing_shopify_scopes?: unknown,
 *   shopify_scopes?: unknown,
 * } | null | undefined} store
 */
export function shopifyPermissionSummary(store) {
  if (!store?.is_connected) {
    return {
      state: 'not_connected',
      label: 'Not applicable',
      detail: 'Connect Shopify before reviewing commerce permissions.',
      missing: [],
      granted: [],
      historicalOrders: false,
    }
  }

  const missing = describeShopifyScopes(store.missing_shopify_scopes)
  const granted = describeShopifyScopes(store.shopify_scopes)
  const historicalOrders = hasHistoricalOrderAccess(store)

  if (store.requires_shopify_reauth || missing.length > 0) {
    return {
      state: 'needs_reauth',
      label: 'Additional permissions required',
      detail:
        'This store is still connected, but Inboxly needs the merchant to approve missing Shopify permissions.',
      missing,
      granted,
      historicalOrders,
    }
  }

  return {
    state: 'ok',
    label: 'Commerce permissions granted',
    detail: 'Granted scopes come from Shopify. Protected customer data is a separate Shopify approval.',
    missing: [],
    granted,
    historicalOrders,
  }
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeCallbackStoreId(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Idempotent gate for OAuth-return processing.
 * Marks a key completed only after success; abandoned in-flight runs can retry.
 */
export function createShopifyOAuthReturnGate() {
  /** @type {string | null} */
  let completedKey = null
  /** @type {string | null} */
  let inFlightKey = null

  return {
    /**
     * @param {string} key
     * @returns {'run' | 'skip_completed' | 'skip_inflight'}
     */
    begin(key) {
      if (completedKey === key) return 'skip_completed'
      if (inFlightKey === key) return 'skip_inflight'
      inFlightKey = key
      return 'run'
    },
    /**
     * @param {string} key
     */
    abandon(key) {
      if (inFlightKey === key) {
        inFlightKey = null
      }
    },
    /**
     * @param {string} key
     */
    complete(key) {
      completedKey = key
      if (inFlightKey === key) {
        inFlightKey = null
      }
    },
    getState() {
      return { completedKey, inFlightKey }
    },
  }
}

/**
 * Build a user-facing flash after Shopify OAuth error returns.
 *
 * @param {{
 *   shopify: string | null,
 *   reason?: string | null,
 * }} input
 */
export function shopifyOAuthErrorFlash({ shopify, reason = null }) {
  if (shopify !== 'error') return null

  const code = typeof reason === 'string' && reason !== '' ? reason : 'unknown'
  if (code === 'authorization_denied') {
    return {
      tone: 'warning',
      message:
        'Shopify authorization was cancelled or denied. No connection changes were applied.',
    }
  }
  if (code === 'validation') {
    return {
      tone: 'danger',
      message: 'Shopify authorization could not be validated. Try connecting again.',
    }
  }
  return {
    tone: 'danger',
    message: `Shopify connection did not complete (${code}). The store stays in its previous connection state until authorization succeeds.`,
  }
}

/**
 * Resolve Shopify OAuth return query into flash feedback.
 * Success path requires an exact callback store_id match in refreshed stores.
 * Never falls back to stores[0]. Never invents grants from the query string alone.
 *
 * @param {{
 *   shopify: string | null,
 *   reason?: string | null,
 *   callbackStoreId?: string | null,
 *   stores?: object[],
 *   refreshFailed?: boolean,
 *   selectedStoreId?: string | null,
 * }} input
 * @returns {{
 *   flash: { tone: string, message: string } | null,
 *   clearUrl: boolean,
 *   matchedStore: object | null,
 *   outcome:
 *     | 'ignored'
 *     | 'error'
 *     | 'refresh_failed'
 *     | 'missing_store_id'
 *     | 'store_not_found'
 *     | 'needs_reauth'
 *     | 'connected'
 *     | 'not_connected'
 *     | 'unexpected',
 * }}
 */
export function resolveShopifyOAuthCallback({
  shopify,
  reason = null,
  callbackStoreId = null,
  stores = [],
  refreshFailed = false,
  selectedStoreId = null,
}) {
  if (!shopify) {
    return { flash: null, clearUrl: false, matchedStore: null, outcome: 'ignored' }
  }

  if (shopify === 'error') {
    return {
      flash: shopifyOAuthErrorFlash({ shopify, reason }),
      clearUrl: true,
      matchedStore: null,
      outcome: 'error',
    }
  }

  if (shopify !== 'connected') {
    return {
      flash: {
        tone: 'danger',
        message: `Unexpected Shopify return status (${shopify}).`,
      },
      clearUrl: true,
      matchedStore: null,
      outcome: 'unexpected',
    }
  }

  if (refreshFailed) {
    return {
      flash: {
        tone: 'warning',
        message:
          'Shopify reported a successful authorization, but Inboxly could not refresh store data to verify the connection. Reload this page or reconnect Shopify.',
      },
      clearUrl: true,
      matchedStore: null,
      outcome: 'refresh_failed',
    }
  }

  const storeId = normalizeCallbackStoreId(callbackStoreId)
  if (!storeId) {
    return {
      flash: {
        tone: 'warning',
        message:
          'Shopify authorization returned successfully, but the connected store could not be identified. Inboxly did not assume permissions were granted.',
      },
      clearUrl: true,
      matchedStore: null,
      outcome: 'missing_store_id',
    }
  }

  const list = Array.isArray(stores) ? stores : []
  const matchedStore = list.find((store) => store && store.id === storeId) ?? null
  if (!matchedStore) {
    return {
      flash: {
        tone: 'warning',
        message:
          'Shopify authorization returned successfully, but the connected store was not found after refresh. Inboxly did not assume permissions were granted.',
      },
      clearUrl: true,
      matchedStore: null,
      outcome: 'store_not_found',
    }
  }

  const permissions = shopifyPermissionSummary(matchedStore)
  const storeLabel = matchedStore.name || matchedStore.domain || storeId
  const otherStore =
    typeof selectedStoreId === 'string' &&
    selectedStoreId !== '' &&
    selectedStoreId !== storeId
  const forStore = otherStore ? ` for store “${storeLabel}”` : ''

  if (permissions.state === 'needs_reauth') {
    return {
      flash: {
        tone: 'warning',
        message: `Shopify OAuth finished${forStore}, but additional permissions are still required. Use Reconnect Shopify and approve the missing scopes.`,
      },
      clearUrl: true,
      matchedStore,
      outcome: 'needs_reauth',
    }
  }

  if (matchedStore.is_connected) {
    return {
      flash: {
        tone: 'success',
        message: otherStore
          ? `Shopify connection completed for store “${storeLabel}”. Commerce permissions were refreshed from Shopify.`
          : 'Shopify connection completed. Commerce permissions were refreshed from Shopify for this store.',
      },
      clearUrl: true,
      matchedStore,
      outcome: 'connected',
    }
  }

  return {
    flash: {
      tone: 'warning',
      message: `Shopify OAuth returned success${forStore}, but that store is not marked connected yet. Refresh or try reconnecting.`,
    },
    clearUrl: true,
    matchedStore,
    outcome: 'not_connected',
  }
}

/**
 * @deprecated Prefer resolveShopifyOAuthCallback for success paths.
 * Kept for focused error-message helpers/tests.
 *
 * @param {{
 *   shopify: string | null,
 *   reason?: string | null,
 *   store?: object | null,
 * }} input
 */
export function shopifyOAuthReturnFlash({ shopify, reason = null, store = null }) {
  if (shopify === 'error') {
    return shopifyOAuthErrorFlash({ shopify, reason })
  }

  if (shopify === 'connected') {
    const resolved = resolveShopifyOAuthCallback({
      shopify,
      reason,
      callbackStoreId: store?.id ?? null,
      stores: store ? [store] : [],
      refreshFailed: false,
      selectedStoreId: store?.id ?? null,
    })
    return resolved.flash
  }

  return null
}
