import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  normalizeShopDomain,
  resolveBackendStoreForOAuth,
  shopifyOAuthStartPath,
  startShopifyOAuth,
} from './shopifyOAuth.js'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('shopifyOAuth helpers', () => {
  it('normalizes shop domains', () => {
    assert.equal(
      normalizeShopDomain('https://Acme-Shop.myshopify.com/admin'),
      'acme-shop.myshopify.com',
    )
    assert.equal(normalizeShopDomain(''), null)
  })

  it('builds same-origin oauth start paths from backend store ids only', () => {
    assert.equal(
      shopifyOAuthStartPath('01STOREID', 'acme-shop.myshopify.com'),
      '/api/v1/stores/01STOREID/shopify/oauth/start?shop=acme-shop.myshopify.com',
    )
    assert.equal(
      shopifyOAuthStartPath('01STOREID'),
      '/api/v1/stores/01STOREID/shopify/oauth/start',
    )
    assert.throws(() => shopifyOAuthStartPath(''), ApiError)
    assert.throws(() => shopifyOAuthStartPath(null), ApiError)
  })

  it('resolves backend store from active_store_id without using mock ids', async () => {
    const calls = []
    const apiFetchFn = async (path) => {
      calls.push(path)
      if (path === '/api/v1/auth/me') {
        return jsonResponse(200, {
          data: {
            workspaces: [{ id: 'ws1', active_store_id: '01REALSTORE' }],
          },
        })
      }
      throw new Error(`Unexpected path ${path}`)
    }

    const result = await resolveBackendStoreForOAuth({
      selectedDomain: 'acme-shop.myshopify.com',
      apiFetchFn,
    })

    assert.deepEqual(result, {
      storeId: '01REALSTORE',
      shopDomain: 'acme-shop.myshopify.com',
    })
    assert.deepEqual(calls, ['/api/v1/auth/me'])
  })

  it('matches selected domain when listing workspace stores', async () => {
    const apiFetchFn = async (path) => {
      if (path === '/api/v1/auth/me') {
        return jsonResponse(200, {
          data: { workspaces: [{ id: 'ws1', active_store_id: null }] },
        })
      }
      if (path === '/api/v1/workspaces/ws1/stores') {
        return jsonResponse(200, {
          data: [
            { id: '01OTHER', domain: 'other.myshopify.com', connection_status: 'pending' },
            { id: '01MATCH', domain: 'acme-shop.myshopify.com', connection_status: 'pending' },
          ],
        })
      }
      throw new Error(`Unexpected path ${path}`)
    }

    const result = await resolveBackendStoreForOAuth({
      selectedDomain: 'https://acme-shop.myshopify.com',
      apiFetchFn,
    })

    assert.equal(result.storeId, '01MATCH')
    assert.equal(result.shopDomain, 'acme-shop.myshopify.com')
  })

  it('surfaces unauthenticated and empty-workspace errors during resolution', async () => {
    await assert.rejects(
      () =>
        resolveBackendStoreForOAuth({
          apiFetchFn: async () => jsonResponse(401, { message: 'Unauthenticated.' }),
        }),
      (error) => error instanceof ApiError && error.status === 401 && /Sign in/i.test(error.message),
    )

    await assert.rejects(
      () =>
        resolveBackendStoreForOAuth({
          apiFetchFn: async () => jsonResponse(200, { data: { workspaces: [] } }),
        }),
      (error) => error instanceof ApiError && /workspace/i.test(error.message),
    )
  })

  it('navigates to the same-origin Laravel start URL after resolving a backend store', async () => {
    const assigned = []
    const apiFetchFn = async (path) => {
      // Must not fetch the OAuth start endpoint (302 Location is opaque to fetch).
      assert.equal(path.startsWith('/api/v1/stores/'), false)
      if (path === '/api/v1/auth/me') {
        return jsonResponse(200, {
          data: { workspaces: [{ id: 'ws1', active_store_id: '01REALSTORE' }] },
        })
      }
      throw new Error(`Unexpected path ${path}`)
    }

    const result = await startShopifyOAuth({
      selectedDomain: 'acme-shop.myshopify.com',
      apiFetchFn,
      assignLocation: (url) => assigned.push(url),
    })

    assert.deepEqual(assigned, [
      '/api/v1/stores/01REALSTORE/shopify/oauth/start?shop=acme-shop.myshopify.com',
    ])
    assert.equal(result.navigated, true)
    assert.equal(
      result.path,
      '/api/v1/stores/01REALSTORE/shopify/oauth/start?shop=acme-shop.myshopify.com',
    )
  })

  it('surfaces network failures during store resolution', async () => {
    await assert.rejects(
      () =>
        startShopifyOAuth({
          apiFetchFn: async () => {
            throw new TypeError('Failed to fetch')
          },
        }),
      (error) => error instanceof ApiError && /Network error/i.test(error.message),
    )
  })
})
