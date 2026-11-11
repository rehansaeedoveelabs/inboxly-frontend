import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  audienceFetch,
  audienceResourcePath,
  assertAudienceOk,
  buildAudienceQuery,
  readAudienceCollection,
  readAudienceCursorPage,
  readAudienceResource,
  requireActiveStoreId,
  requireStoreId,
  storeAudiencePath,
} from './audienceApi.js'

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

describe('audienceApi foundation', () => {
  it('rejects missing store ids before any request is built', () => {
    assert.throws(() => requireStoreId(null), (error) => error instanceof ApiError && error.status === 422)
    assert.throws(() => requireStoreId(''), (error) => error instanceof ApiError)
    assert.throws(() => requireActiveStoreId(null), (error) => error instanceof ApiError)
    assert.throws(() => requireActiveStoreId({}), (error) => error instanceof ApiError)
    assert.equal(requireActiveStoreId({ id: '01STORE' }), '01STORE')
  })

  it('builds store-scoped and resource-scoped paths with encoding', () => {
    assert.equal(storeAudiencePath('01STORE', 'contacts'), '/api/v1/stores/01STORE/contacts')
    assert.equal(
      storeAudiencePath('01STORE', 'contact-imports'),
      '/api/v1/stores/01STORE/contact-imports',
    )
    assert.equal(
      audienceResourcePath('contacts', '01CONTACT', 'tags'),
      '/api/v1/contacts/01CONTACT/tags',
    )
    assert.throws(() => storeAudiencePath(''), (error) => error instanceof ApiError)
  })

  it('builds Laravel-compatible audience query strings', () => {
    assert.equal(buildAudienceQuery({}), '')
    assert.equal(
      buildAudienceQuery({
        cursor: 'abc',
        limit: 25,
        q: 'ami',
        tag: 'vip',
        consent_email: 'subscribed',
        empty: '',
        missing: undefined,
      }),
      '?cursor=abc&limit=25&q=ami&tag=vip&consent_email=subscribed',
    )
  })

  it('uses apiFetch (Sanctum CSRF + credentials) for audience requests', async () => {
    let sawCredentials = false
    let sawCsrf = false
    const fetchFn = async (url, options = {}) => {
      if (String(url).includes('/sanctum/csrf-cookie')) {
        sawCsrf = true
        return new Response(null, { status: 204 })
      }
      sawCredentials = options.credentials === 'include'
      assert.equal(options.headers.get('X-XSRF-TOKEN'), 'token')
      assert.equal(options.headers.get('Accept'), 'application/json')
      return jsonResponse(200, { data: [{ id: '01TAG' }] })
    }

    const path = storeAudiencePath('01STORE', 'tags')
    const response = await audienceFetch(path, { method: 'GET' }, {
      fetchFn,
      cookieString: 'XSRF-TOKEN=token',
    })

    assert.equal(sawCsrf, true)
    assert.equal(sawCredentials, true)
    assert.equal(response.ok, true)
  })

  it('parses Laravel resource, collection, and cursor page envelopes', async () => {
    const resource = await readAudienceResource(
      jsonResponse(200, { data: { id: '01C', first_name: 'Amina' } }),
      'contact',
    )
    assert.equal(resource.id, '01C')
    assert.equal(resource.first_name, 'Amina')

    const collection = await readAudienceCollection(
      jsonResponse(200, { data: [{ id: '01T' }] }),
      'tags',
    )
    assert.equal(collection.length, 1)

    const page = await readAudienceCursorPage(
      jsonResponse(200, {
        data: [{ id: '01C' }],
        links: { next: 'https://example.test/next', prev: null },
        meta: { per_page: 25, next_cursor: 'cursor-2', prev_cursor: null },
      }),
    )
    assert.equal(page.data[0].id, '01C')
    assert.equal(page.nextCursor, 'cursor-2')
    assert.equal(page.meta.per_page, 25)
  })

  it('maps Laravel error responses through toApiError', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/contacts': jsonResponse(403, {
        message: 'This action is unauthorized.',
      }),
    })

    const response = await audienceFetch(storeAudiencePath('01STORE', 'contacts'), { method: 'GET' }, {
      fetchFn,
      cookieString: 'XSRF-TOKEN=token',
    })

    await assert.rejects(
      () => assertAudienceOk(response, 'Unable to load contacts.'),
      (error) =>
        error instanceof ApiError &&
        error.status === 403 &&
        error.message === 'You do not have permission to do that.',
    )
  })

  it('does not call the network when active store is missing', async () => {
    let called = false
    const fetchFn = async () => {
      called = true
      return jsonResponse(200, { data: [] })
    }

    assert.throws(() => storeAudiencePath(null, 'contacts'), (error) => error instanceof ApiError)
    assert.equal(called, false)

    // Guard pattern pages will use: resolve store first, then fetch.
    assert.throws(() => {
      const storeId = requireActiveStoreId(null)
      return audienceFetch(storeAudiencePath(storeId, 'tags'), { method: 'GET' }, { fetchFn })
    }, (error) => error instanceof ApiError && error.status === 422)

    assert.equal(called, false)
  })
})
