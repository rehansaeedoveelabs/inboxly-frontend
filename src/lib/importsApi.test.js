import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import { getContactImport, isImportTerminal, pollContactImport, startContactImport } from './importsApi.js'

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

describe('importsApi', () => {
  it('starts an import with rows/tags/filename and returns 202 resource', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/contact-imports': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(202, {
          data: {
            id: '01IMP',
            store_id: '01STORE',
            status: 'pending',
            total_rows: 2,
            processed_rows: 0,
            created_count: 0,
            updated_count: 0,
            failed_rows: 0,
            original_filename: 'contacts.csv',
          },
        })
      },
    })

    const started = await startContactImport(
      '01STORE',
      {
        rows: [{ email: 'a@x.com' }, { email: 'b@x.com' }],
        tags: ['Imported'],
        filename: 'contacts.csv',
      },
      { fetchFn },
    )
    assert.equal(started.status, 'pending')
    assert.equal(body.filename, 'contacts.csv')
    assert.deepEqual(body.tags, ['Imported'])
  })

  it('polls until terminal status', async () => {
    let polls = 0
    const fetchFn = createFetchMock({
      'GET /api/v1/contact-imports/01IMP': () => {
        polls += 1
        if (polls === 1) {
          return jsonResponse(200, {
            data: { id: '01IMP', status: 'processing', processed_rows: 1, total_rows: 2 },
          })
        }
        return jsonResponse(200, {
          data: {
            id: '01IMP',
            status: 'completed',
            processed_rows: 2,
            total_rows: 2,
            created_count: 1,
            updated_count: 0,
            restored_count: 1,
            failed_rows: 0,
          },
        })
      },
    })

    const result = await pollContactImport('01IMP', {
      fetchFn,
      intervalMs: 1,
      maxAttempts: 5,
      sleepFn: async () => {},
    })
    assert.equal(result.status, 'completed')
    assert.equal(result.restored_count, 1)
    assert.equal(polls, 2)
    assert.equal(isImportTerminal('pending'), false)
    assert.equal(isImportTerminal('completed'), true)
  })

  it('rejects missing store/import ids before network', async () => {
    let called = false
    const fetchFn = async () => {
      called = true
      return jsonResponse(200, { data: {} })
    }
    await assert.rejects(
      () => startContactImport('', { rows: [{ email: 'a@x.com' }] }, { fetchFn }),
      (e) => e instanceof ApiError,
    )
    await assert.rejects(() => getContactImport('', { fetchFn }), (e) => e instanceof ApiError)
    assert.equal(called, false)
  })
})
