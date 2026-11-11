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

  it('builds oauth start paths without a shop override query', () => {
    assert.equal(
      shopifyOAuthStartPath('01STOREID'),
      '/api/v1/stores/01STOREID/shopify/oauth/start',
    )
    assert.equal(shopifyOAuthStartPath('01STOREID').includes('?'), false)
    assert.throws(() => shopifyOAuthStartPath(''), ApiError)
    assert.throws(() => shopifyOAuthStartPath(null), ApiError)
  })

  it('uses an explicit backend store id without fetching or appending shop', async () => {
    const assigned = []
    const result = await startShopifyOAuth({
      storeId: '01REALSTORE',
      apiFetchFn: async () => {
        throw new Error('should not fetch when storeId is provided')
      },
      assignLocation: (url) => assigned.push(url),
    })

    assert.deepEqual(assigned, ['/api/v1/stores/01REALSTORE/shopify/oauth/start'])
    assert.equal(result.path.includes('shop='), false)
  })

  it('resolves backend store from active_store_id without mock ids', async () => {
    const result = await resolveBackendStoreForOAuth({
      apiFetchFn: async (path) => {
        assert.equal(path, '/api/v1/auth/me')
        return jsonResponse(200, {
          data: {
            workspaces: [{ id: 'ws1', active_store_id: '01REALSTORE' }],
          },
        })
      },
    })

    assert.deepEqual(result, { storeId: '01REALSTORE' })
  })

  it('falls back to a pending workspace store when no active store is set', async () => {
    const result = await resolveBackendStoreForOAuth({
      apiFetchFn: async (path) => {
        if (path === '/api/v1/auth/me') {
          return jsonResponse(200, {
            data: { workspaces: [{ id: 'ws1', active_store_id: null }] },
          })
        }
        if (path === '/api/v1/workspaces/ws1/stores') {
          return jsonResponse(200, {
            data: [
              { id: '01OTHER', domain: 'other.myshopify.com', connection_status: 'connected' },
              { id: '01PENDING', domain: 'acme-shop.myshopify.com', connection_status: 'pending' },
            ],
          })
        }
        throw new Error(`Unexpected path ${path}`)
      },
    })

    assert.equal(result.storeId, '01PENDING')
  })

  it('surfaces empty store and auth errors', async () => {
    await assert.rejects(
      () =>
        resolveBackendStoreForOAuth({
          apiFetchFn: async () => jsonResponse(401, { message: 'Unauthenticated.' }),
        }),
      (error) => error instanceof ApiError && error.status === 401,
    )

    await assert.rejects(
      () =>
        resolveBackendStoreForOAuth({
          apiFetchFn: async (path) => {
            if (path === '/api/v1/auth/me') {
              return jsonResponse(200, {
                data: { workspaces: [{ id: 'ws1', active_store_id: null }] },
              })
            }
            return jsonResponse(200, { data: [] })
          },
        }),
      (error) => error instanceof ApiError && /Create an Inboxly store/i.test(error.message),
    )
  })
})
