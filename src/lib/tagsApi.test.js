import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import { createStoreTag, deleteTag, listStoreTags, updateTag } from './tagsApi.js'

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
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

const sampleTag = {
  id: '01TAG',
  store_id: '01STORE',
  name: 'VIP',
  slug: 'vip',
  color: '#ff0000',
  created_at: '2026-01-01T00:00:00.000000Z',
  updated_at: '2026-01-01T00:00:00.000000Z',
}

describe('tagsApi', () => {
  it('lists tags for a store using the collection envelope', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/tags': jsonResponse(200, { data: [sampleTag] }),
    })

    const tags = await listStoreTags('01STORE', { fetchFn })
    assert.equal(tags.length, 1)
    assert.equal(tags[0].slug, 'vip')
    assert.equal(tags[0].color, '#ff0000')
  })

  it('rejects missing store id before any network request', async () => {
    let called = false
    const fetchFn = async () => {
      called = true
      return jsonResponse(200, { data: [] })
    }

    await assert.rejects(
      () => listStoreTags(null, { fetchFn }),
      (error) => error instanceof ApiError && error.status === 422,
    )
    assert.equal(called, false)
  })

  it('creates a tag and returns the TagResource', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/tags': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(201, { data: { ...sampleTag, name: body.name, slug: 'gold' } })
      },
    })

    const tag = await createStoreTag('01STORE', { name: 'Gold', color: '#00ff00' }, { fetchFn })
    assert.deepEqual(body, { name: 'Gold', color: '#00ff00' })
    assert.equal(tag.name, 'Gold')
    assert.equal(tag.slug, 'gold')
  })

  it('surfaces Laravel validation errors on create', async () => {
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/tags': jsonResponse(422, {
        message: 'The name has already been taken.',
        errors: { name: ['A tag with this name already exists in the store.'] },
      }),
    })

    await assert.rejects(
      () => createStoreTag('01STORE', { name: 'VIP' }, { fetchFn }),
      (error) =>
        error instanceof ApiError &&
        error.status === 422 &&
        error.errors?.name?.[0] === 'A tag with this name already exists in the store.',
    )
  })

  it('updates a tag by resource id', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'PUT /api/v1/tags/01TAG': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(200, { data: { ...sampleTag, name: 'Gold' } })
      },
    })

    const tag = await updateTag('01TAG', { name: 'Gold' }, { fetchFn })
    assert.deepEqual(body, { name: 'Gold' })
    assert.equal(tag.name, 'Gold')
    assert.equal(tag.slug, 'vip')
  })

  it('deletes a tag and tolerates 204 with no body', async () => {
    const fetchFn = createFetchMock({
      'DELETE /api/v1/tags/01TAG': new Response(null, { status: 204 }),
    })

    await deleteTag('01TAG', { fetchFn })
  })

  it('maps network/API failures through toApiError', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/tags': jsonResponse(500, { message: 'Server error' }),
    })

    await assert.rejects(
      () => listStoreTags('01STORE', { fetchFn }),
      (error) => error instanceof ApiError && error.status === 500,
    )
  })

  it('rejects empty tag id before delete/update requests', async () => {
    let called = false
    const fetchFn = async () => {
      called = true
      return new Response(null, { status: 204 })
    }

    await assert.rejects(() => deleteTag('', { fetchFn }), (error) => error instanceof ApiError)
    await assert.rejects(() => updateTag(null, { name: 'x' }, { fetchFn }), (error) => error instanceof ApiError)
    assert.equal(called, false)
  })
})
