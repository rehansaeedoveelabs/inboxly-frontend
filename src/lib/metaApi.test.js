import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  disconnectMetaConnection,
  discoverMetaPages,
  getMetaConnection,
  metaOAuthStartPath,
  removeMetaPage,
  selectMetaPages,
  setDefaultMetaPage,
  startMetaOAuth,
} from './metaApi.js'

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

describe('metaApi', () => {
  it('builds oauth start path and navigates', async () => {
    assert.equal(metaOAuthStartPath('01STORE'), '/api/v1/stores/01STORE/meta/oauth/start')
    assert.throws(() => metaOAuthStartPath(''), /store must be selected/i)

    let assigned = null
    const result = await startMetaOAuth({
      storeId: '01STORE',
      assignLocation: (url) => {
        assigned = url
      },
    })
    assert.equal(assigned, '/api/v1/stores/01STORE/meta/oauth/start')
    assert.equal(result.navigated, true)
  })

  it('loads connection without requiring tokens in client contract', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/meta/connection': jsonResponse(200, {
        data: {
          connected: true,
          connection: {
            id: '01CONN',
            status: 'connected',
            meta_user_id: 'user-1',
            scopes: ['pages_show_list'],
            data_access_expires_at: '2026-12-01T00:00:00+00:00',
            last_error_code: null,
            last_error_message: null,
          },
          pages: [
            {
              id: '01PAGE',
              meta_page_id: 'page-1',
              name: 'Demo Page',
              tasks: ['CREATE_CONTENT'],
              is_default: true,
            },
          ],
        },
      }),
    })

    const data = await getMetaConnection('01STORE', { fetchFn })
    assert.equal(data.connected, true)
    assert.equal(data.pages[0].name, 'Demo Page')
    assert.equal(data.connection.data_access_expires_at, '2026-12-01T00:00:00+00:00')
    assert.equal('user_access_token' in (data.connection || {}), false)
    assert.equal('page_access_token' in (data.pages[0] || {}), false)
  })

  it('surfaces safe reconnect guidance on needs_reauth without credentials', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/meta/connection': jsonResponse(200, {
        data: {
          connected: true,
          connection: {
            id: '01CONN',
            status: 'needs_reauth',
            meta_user_id: 'user-1',
            scopes: ['pages_show_list'],
            data_access_expires_at: null,
            last_error_code: 'data_access_expired',
            last_error_message: 'Meta data access for this connection has expired. Reconnect Meta for this store.',
          },
          pages: [],
        },
      }),
    })

    const data = await getMetaConnection('01STORE', { fetchFn })
    assert.equal(data.connection.status, 'needs_reauth')
    assert.equal(data.connection.last_error_code, 'data_access_expired')
    assert.match(data.connection.last_error_message, /Reconnect Meta/i)
    const encoded = JSON.stringify(data)
    assert.equal(encoded.includes('access_token'), false)
    assert.equal(encoded.includes('EAA'), false)
  })

  it('discovers and selects pages', async () => {
    let selectBody = null
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/meta/pages/discover': jsonResponse(200, {
        data: {
          pages: [{ id: 'page-1', name: '[Simulated] A', tasks: [], already_selected: false }],
        },
      }),
      'POST /api/v1/stores/01STORE/meta/pages/select': async (_url, options) => {
        selectBody = JSON.parse(options.body)
        return jsonResponse(200, {
          data: [
            {
              id: '01PAGE',
              meta_page_id: 'page-1',
              name: '[Simulated] A',
              is_default: true,
              tasks: [],
            },
          ],
        })
      },
    })

    const pages = await discoverMetaPages('01STORE', { fetchFn })
    assert.equal(pages[0].id, 'page-1')
    assert.equal('access_token' in pages[0], false)

    const selected = await selectMetaPages(
      '01STORE',
      { pageIds: ['page-1'], defaultPageId: 'page-1' },
      { fetchFn },
    )
    assert.deepEqual(selectBody, { page_ids: ['page-1'], default_page_id: 'page-1' })
    assert.equal(selected[0].is_default, true)
  })

  it('sets default, removes page, and disconnects', async () => {
    const fetchFn = createFetchMock({
      'PUT /api/v1/stores/01STORE/meta/pages/01PAGE/default': jsonResponse(200, {
        data: { id: '01PAGE', meta_page_id: 'page-1', name: 'A', is_default: true, tasks: [] },
      }),
      'DELETE /api/v1/stores/01STORE/meta/pages/01PAGE': jsonResponse(200, {
        data: { removed: true },
      }),
      'DELETE /api/v1/stores/01STORE/meta/connection': jsonResponse(200, {
        data: { disconnected: true },
      }),
    })

    const def = await setDefaultMetaPage('01STORE', '01PAGE', { fetchFn })
    assert.equal(def.is_default, true)
    assert.equal(await removeMetaPage('01STORE', '01PAGE', { fetchFn }), true)
    const disconnected = await disconnectMetaConnection('01STORE', { fetchFn })
    assert.equal(disconnected.disconnected, true)
  })

  it('surfaces API errors', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/meta/connection': jsonResponse(403, {
        message: 'This action is unauthorized.',
      }),
    })

    await assert.rejects(
      () => getMetaConnection('01STORE', { fetchFn }),
      (error) => error instanceof ApiError && error.status === 403,
    )
  })
})
