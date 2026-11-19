import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  getShopifyCommerceSync,
  isShopifySyncInFlight,
  shopifySyncStatusLabel,
  shopifySyncStatusTone,
  startShopifyCommerceSync,
} from './shopifySyncApi.js'

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

describe('shopifySyncApi', () => {
  it('labels and tones sync statuses', () => {
    assert.equal(shopifySyncStatusLabel(null), 'Never synced')
    assert.equal(shopifySyncStatusLabel('running'), 'Syncing')
    assert.equal(shopifySyncStatusTone('succeeded'), 'success')
    assert.equal(shopifySyncStatusTone('failed'), 'danger')
    assert.equal(isShopifySyncInFlight({ summary: { status: 'running' } }), true)
    assert.equal(isShopifySyncInFlight({ summary: { status: 'succeeded' } }), false)
  })

  it('loads sync status payload', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01S/shopify/sync': jsonResponse(200, {
        data: {
          summary: { status: 'succeeded', customers_synced: 2 },
          latest_run: { id: '01R', status: 'succeeded' },
          counts: { customer_identities: 2, products: 5, orders: 3 },
        },
      }),
    })

    const data = await getShopifyCommerceSync('01S', {
      fetchFn,
      cookieString: 'XSRF-TOKEN=token',
    })

    assert.equal(data.summary.status, 'succeeded')
    assert.equal(data.counts.products, 5)
    assert.equal(data.latest_run.id, '01R')
  })

  it('starts sync and returns run', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01S/shopify/sync': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(202, {
          data: { id: '01RUN', status: 'pending', resources: ['products'] },
        })
      },
    })

    const run = await startShopifyCommerceSync(
      '01S',
      { resources: ['products'] },
      { fetchFn, cookieString: 'XSRF-TOKEN=token' },
    )

    assert.deepEqual(body.resources, ['products'])
    assert.equal(run.id, '01RUN')
    assert.equal(run.status, 'pending')
  })

  it('maps API failures to ApiError', async () => {
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01S/shopify/sync': jsonResponse(422, {
        message: 'The given data was invalid.',
        errors: { resources: ['Missing Shopify scopes'] },
      }),
    })

    await assert.rejects(
      () => startShopifyCommerceSync('01S', {}, { fetchFn, cookieString: 'XSRF-TOKEN=token' }),
      (error) => error instanceof ApiError && error.status === 422,
    )
  })
})
