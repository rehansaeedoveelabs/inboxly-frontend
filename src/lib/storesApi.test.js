import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  activateStore,
  createWorkspaceStore,
  disconnectShopifyStore,
  listWorkspaceStores,
  storeStatusLabel,
  storeStatusTone,
} from './storesApi.js'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createFetchMock(handlers) {
  return async (url, options = {}) => {
    if (String(url).includes('/sanctum/csrf-cookie')) {
      return new Response(null, { status: 204 })
    }
    const method = options.method || 'GET'
    const handler = handlers[`${method} ${url}`]
    if (!handler) throw new Error(`Unexpected fetch: ${method} ${url}`)
    return typeof handler === 'function' ? handler(url, options) : handler
  }
}

describe('storesApi', () => {
  it('creates a real pending store without sending is_demo', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'POST /api/v1/workspaces/ws1/stores': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(201, {
          data: {
            id: '01NEWSTORE',
            name: 'Acme',
            domain: 'acme.myshopify.com',
            connection_status: 'pending',
            is_demo: false,
            is_connected: false,
          },
        })
      },
    })

    const store = await createWorkspaceStore(
      'ws1',
      { name: 'Acme', domain: 'acme.myshopify.com' },
      { fetchFn, cookieString: 'XSRF-TOKEN=token' },
    )

    assert.equal(body.is_demo, undefined)
    assert.equal(store.id, '01NEWSTORE')
    assert.equal(store.connection_status, 'pending')
    assert.equal(store.is_connected, false)
  })

  it('lists workspace stores and activates by backend store id', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/workspaces/ws1/stores': jsonResponse(200, {
        data: [{ id: '01A', name: 'A', connection_status: 'pending', is_demo: false }],
      }),
      'POST /api/v1/stores/01A/activate': jsonResponse(200, {
        data: {
          workspace_id: 'ws1',
          active_store_id: '01A',
          active_store: { id: '01A', name: 'A' },
        },
      }),
    })

    const stores = await listWorkspaceStores('ws1', { fetchFn, cookieString: 'XSRF-TOKEN=token' })
    assert.equal(stores.length, 1)

    const context = await activateStore('01A', { fetchFn, cookieString: 'XSRF-TOKEN=token' })
    assert.equal(context.active_store_id, '01A')
  })

  it('surfaces empty-state helpers for pending and connected stores', () => {
    assert.equal(storeStatusLabel('pending'), 'Pending connection')
    assert.equal(storeStatusTone('pending'), 'warning')
    assert.equal(storeStatusLabel('connected'), 'Connected')
    assert.equal(storeStatusTone('connected'), 'success')
  })

  it('rejects missing workspace ids', async () => {
    await assert.rejects(() => listWorkspaceStores(''), (error) => error instanceof ApiError)
    await assert.rejects(
      () => createWorkspaceStore('', { name: 'A', domain: 'a.myshopify.com' }),
      (error) => error instanceof ApiError,
    )
  })

  it('disconnects Shopify and retains remote_revoked meta', async () => {
    const fetchFn = createFetchMock({
      'DELETE /api/v1/stores/01CONN/shopify/connection': jsonResponse(200, {
        data: {
          id: '01CONN',
          connection_status: 'disconnected',
          is_connected: false,
          shopify_shop_domain: 'acme.myshopify.com',
        },
        meta: { remote_revoked: true },
      }),
    })

    const result = await disconnectShopifyStore('01CONN', {
      fetchFn,
      cookieString: 'XSRF-TOKEN=token',
    })

    assert.equal(result.store.connection_status, 'disconnected')
    assert.equal(result.store.is_connected, false)
    assert.equal(result.remote_revoked, true)
    assert.equal(result.meta.remote_revoked, true)
  })

  it('treats missing remote_revoked as false so UI cannot claim uninstall', async () => {
    const fetchFn = createFetchMock({
      'DELETE /api/v1/stores/01CONN/shopify/connection': jsonResponse(200, {
        data: {
          id: '01CONN',
          connection_status: 'disconnected',
          is_connected: false,
        },
        meta: {},
      }),
    })

    const result = await disconnectShopifyStore('01CONN', {
      fetchFn,
      cookieString: 'XSRF-TOKEN=token',
    })

    assert.equal(result.remote_revoked, false)
  })
})
