import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  createStoreSegment,
  deleteSegment,
  listStoreSegments,
  previewSegment,
  updateSegment,
} from './segmentsApi.js'

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

const sample = {
  id: '01SEG',
  store_id: '01STORE',
  name: 'Gmail',
  description: null,
  rules: { operator: 'and', conditions: [{ field: 'email', op: 'contains', value: '@gmail.com' }] },
}

describe('segmentsApi', () => {
  it('lists, creates, updates, deletes, and previews segments', async () => {
    let createBody = null
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/segments': jsonResponse(200, { data: [sample] }),
      'POST /api/v1/stores/01STORE/segments': async (_url, options) => {
        createBody = JSON.parse(options.body)
        return jsonResponse(201, { data: { ...sample, id: '01NEW', name: createBody.name } })
      },
      'PUT /api/v1/segments/01SEG': jsonResponse(200, { data: { ...sample, name: 'Renamed' } }),
      'DELETE /api/v1/segments/01SEG': new Response(null, { status: 204 }),
      'POST /api/v1/segments/01SEG/preview': jsonResponse(200, {
        count: 2,
        sample: [{ id: '01C', email: 'a@gmail.com', first_name: 'A', last_name: null }],
      }),
    })

    const list = await listStoreSegments('01STORE', { fetchFn })
    assert.equal(list[0].name, 'Gmail')

    const created = await createStoreSegment(
      '01STORE',
      { name: 'New', rules: sample.rules },
      { fetchFn },
    )
    assert.equal(created.id, '01NEW')
    assert.equal(createBody.name, 'New')

    const updated = await updateSegment('01SEG', { name: 'Renamed' }, { fetchFn })
    assert.equal(updated.name, 'Renamed')

    await deleteSegment('01SEG', { fetchFn })

    const preview = await previewSegment('01SEG', { fetchFn })
    assert.equal(preview.count, 2)
    assert.equal(preview.sample.length, 1)
  })

  it('rejects missing store/segment ids before network calls', async () => {
    let called = false
    const fetchFn = async () => {
      called = true
      return jsonResponse(200, { data: [] })
    }
    await assert.rejects(() => listStoreSegments('', { fetchFn }), (e) => e instanceof ApiError)
    await assert.rejects(() => previewSegment(null, { fetchFn }), (e) => e instanceof ApiError)
    assert.equal(called, false)
  })

  it('surfaces validation errors on create', async () => {
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/segments': jsonResponse(422, {
        message: 'The given data was invalid.',
        errors: { rules: ['Rules.conditions.0.field: Unknown field.'] },
      }),
    })
    await assert.rejects(
      () =>
        createStoreSegment(
          '01STORE',
          { name: 'Bad', rules: { operator: 'and', conditions: [] } },
          { fetchFn },
        ),
      (error) => error instanceof ApiError && error.status === 422,
    )
  })
})
