import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createShopifyOAuthReturnGate,
  describeShopifyScopes,
  hasHistoricalOrderAccess,
  normalizeCallbackStoreId,
  normalizeShopifyScopes,
  resolveShopifyOAuthCallback,
  shopifyOAuthErrorFlash,
  shopifyOAuthReturnFlash,
  shopifyPermissionSummary,
  shopifyScopeLabel,
} from './shopifyScopes.js'

const storeA = {
  id: '01STOREA',
  name: 'Store A',
  domain: 'a.myshopify.com',
  is_connected: true,
  requires_shopify_reauth: false,
  missing_shopify_scopes: [],
  shopify_scopes: [
    'read_customers',
    'read_products',
    'read_orders',
    'read_all_orders',
  ],
}

const storeBIncomplete = {
  id: '01STOREB',
  name: 'Store B',
  domain: 'b.myshopify.com',
  is_connected: true,
  requires_shopify_reauth: true,
  missing_shopify_scopes: ['read_all_orders'],
  shopify_scopes: ['read_orders', 'read_products'],
}

describe('shopifyScopes helpers', () => {
  it('normalizes and labels scopes without inventing grants', () => {
    assert.deepEqual(normalizeShopifyScopes([' read_orders ', '', null, 12]), ['read_orders'])
    assert.equal(shopifyScopeLabel('read_all_orders'), 'Read all historical orders')
    assert.equal(shopifyScopeLabel('custom_scope'), 'custom_scope')
    assert.deepEqual(describeShopifyScopes(['read_customers']), [
      { handle: 'read_customers', label: 'Read customers' },
    ])
    assert.equal(normalizeCallbackStoreId(' 01STOREA '), '01STOREA')
    assert.equal(normalizeCallbackStoreId(''), null)
  })

  it('claims historical order access only when both order scopes are granted', () => {
    assert.equal(hasHistoricalOrderAccess({ shopify_scopes: ['read_orders'] }), false)
    assert.equal(hasHistoricalOrderAccess({ shopify_scopes: ['read_all_orders'] }), false)
    assert.equal(
      hasHistoricalOrderAccess({
        shopify_scopes: ['read_orders', 'read_all_orders'],
      }),
      true,
    )
  })

  it('separates connected stores that still need reauth from fully granted ones', () => {
    const needs = shopifyPermissionSummary(storeBIncomplete)
    assert.equal(needs.state, 'needs_reauth')
    assert.equal(needs.missing.length, 1)
    assert.equal(needs.historicalOrders, false)

    const ok = shopifyPermissionSummary(storeA)
    assert.equal(ok.state, 'ok')
    assert.equal(ok.historicalOrders, true)
    assert.match(ok.detail, /Protected customer data/i)
  })

  it('preserves cancellation and unknown error messaging', () => {
    const cancelled = shopifyOAuthErrorFlash({
      shopify: 'error',
      reason: 'authorization_denied',
    })
    assert.equal(cancelled.tone, 'warning')
    assert.match(cancelled.message, /cancelled or denied/i)

    const failed = shopifyOAuthErrorFlash({
      shopify: 'error',
      reason: 'invalid_hmac',
    })
    assert.equal(failed.tone, 'danger')
    assert.match(failed.message, /invalid_hmac/)

    assert.equal(
      resolveShopifyOAuthCallback({
        shopify: 'error',
        reason: 'authorization_denied',
        stores: [storeA],
      }).outcome,
      'error',
    )
  })

  it('uses the callback store_id when multiple stores exist and never falls back to the first store', () => {
    const matched = resolveShopifyOAuthCallback({
      shopify: 'connected',
      callbackStoreId: '01STOREB',
      stores: [storeA, storeBIncomplete],
      selectedStoreId: '01STOREA',
    })
    assert.equal(matched.outcome, 'needs_reauth')
    assert.equal(matched.matchedStore?.id, '01STOREB')
    assert.match(matched.flash.message, /Store B/)
    assert.match(matched.flash.message, /additional permissions/i)
    assert.equal(matched.flash.tone, 'warning')

    const complete = resolveShopifyOAuthCallback({
      shopify: 'connected',
      callbackStoreId: '01STOREA',
      stores: [storeBIncomplete, storeA],
      selectedStoreId: '01STOREA',
    })
    assert.equal(complete.outcome, 'connected')
    assert.equal(complete.matchedStore?.id, '01STOREA')
    assert.equal(complete.flash.tone, 'success')
  })

  it('never claims success when store_id is missing or unmatched', () => {
    const missing = resolveShopifyOAuthCallback({
      shopify: 'connected',
      callbackStoreId: null,
      stores: [storeA],
    })
    assert.equal(missing.outcome, 'missing_store_id')
    assert.equal(missing.matchedStore, null)
    assert.equal(missing.flash.tone, 'warning')
    assert.doesNotMatch(missing.flash.message, /permissions were refreshed/i)

    const unmatched = resolveShopifyOAuthCallback({
      shopify: 'connected',
      callbackStoreId: '01MISSING',
      stores: [storeA, storeBIncomplete],
    })
    assert.equal(unmatched.outcome, 'store_not_found')
    assert.equal(unmatched.matchedStore, null)
    assert.equal(unmatched.flash.tone, 'warning')
    assert.doesNotMatch(unmatched.flash.message, /permissions were refreshed/i)
    assert.doesNotMatch(unmatched.flash.message, /additional permissions are still required/i)
  })

  it('distinguishes refresh failure from confirmed incomplete permissions', () => {
    const refreshFailed = resolveShopifyOAuthCallback({
      shopify: 'connected',
      callbackStoreId: '01STOREB',
      stores: [storeBIncomplete],
      refreshFailed: true,
    })
    assert.equal(refreshFailed.outcome, 'refresh_failed')
    assert.equal(refreshFailed.matchedStore, null)
    assert.match(refreshFailed.flash.message, /could not refresh store data/i)
    assert.doesNotMatch(refreshFailed.flash.message, /additional permissions are still required/i)
    assert.doesNotMatch(refreshFailed.flash.message, /permissions were refreshed/i)

    const incomplete = resolveShopifyOAuthCallback({
      shopify: 'connected',
      callbackStoreId: '01STOREB',
      stores: [storeBIncomplete],
      refreshFailed: false,
    })
    assert.equal(incomplete.outcome, 'needs_reauth')
    assert.match(incomplete.flash.message, /additional permissions/i)
  })

  it('keeps compatible shopifyOAuthReturnFlash behavior for single-store helpers', () => {
    const incomplete = shopifyOAuthReturnFlash({
      shopify: 'connected',
      store: storeBIncomplete,
    })
    assert.equal(incomplete.tone, 'warning')
    assert.match(incomplete.message, /additional permissions/i)

    const complete = shopifyOAuthReturnFlash({
      shopify: 'connected',
      store: storeA,
    })
    assert.equal(complete.tone, 'success')
  })
})

describe('shopify OAuth return gate race safety', () => {
  it('allows retry after an abandoned in-flight run and does not permanently suppress', () => {
    const gate = createShopifyOAuthReturnGate()
    const key = 'connected::01STOREA'

    assert.equal(gate.begin(key), 'run')
    assert.equal(gate.begin(key), 'skip_inflight')

    gate.abandon(key)
    assert.deepEqual(gate.getState(), { completedKey: null, inFlightKey: null })

    assert.equal(gate.begin(key), 'run')
    gate.complete(key)
    assert.equal(gate.begin(key), 'skip_completed')
  })

  it('survives selected-store identity changes without needing them in the callback key', () => {
    const gate = createShopifyOAuthReturnGate()
    const key = 'connected::01STOREB'

    // Simulate effect start while selected store is still loading / changing.
    assert.equal(gate.begin(key), 'run')
    gate.abandon(key)

    // activeStore id changed; callback params did not. Processing must restart.
    assert.equal(gate.begin(key), 'run')

    const outcome = resolveShopifyOAuthCallback({
      shopify: 'connected',
      callbackStoreId: '01STOREB',
      stores: [storeA, storeBIncomplete],
      selectedStoreId: '01STOREA',
    })
    assert.equal(outcome.matchedStore?.id, '01STOREB')
    gate.complete(key)
    assert.equal(gate.begin(key), 'skip_completed')
  })
})
