import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  canDownloadExport,
  downloadContactExport,
  formatExportFilters,
  getContactExport,
  isExportExpired,
  isExportTerminal,
  listStoreContactExports,
  pollContactExport,
  resolveExportFilename,
  startContactExport,
} from './exportsApi.js'

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
    const key = `${method} ${url}`
    const handler = handlers[key]
    if (!handler) throw new Error(`Unexpected fetch: ${key}`)
    return typeof handler === 'function' ? handler(url, options) : handler
  }
}

describe('exportsApi', () => {
  it('starts an export with only supported filters', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/contact-exports': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(202, {
          data: {
            id: '01EXP',
            store_id: '01STORE',
            status: 'pending',
            filters: { q: 'ali', tag: 'vip', consent_email: 'subscribed' },
            original_filename: 'contacts-export.csv',
            total_rows: 0,
            processed_rows: 0,
            download_available: false,
          },
        })
      },
    })

    const started = await startContactExport(
      '01STORE',
      {
        q: '  ali  ',
        tag: 'vip',
        consent_email: 'subscribed',
        bogus: 'ignore-me',
      },
      { fetchFn },
    )

    assert.equal(started.status, 'pending')
    assert.deepEqual(body, {
      q: 'ali',
      tag: 'vip',
      consent_email: 'subscribed',
    })
    assert.equal(body.bogus, undefined)
  })

  it('omits empty filters from the start payload', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/contact-exports': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(202, {
          data: { id: '01EXP', status: 'pending', download_available: false },
        })
      },
    })

    await startContactExport('01STORE', { q: '   ', tag: '', consent_email: null }, { fetchFn })
    assert.deepEqual(body, {})
  })

  it('lists cursor-paginated history', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/contact-exports?limit=25': jsonResponse(200, {
        data: [
          {
            id: '01EXP1',
            status: 'completed',
            original_filename: 'a.csv',
            download_available: true,
          },
        ],
        meta: { next_cursor: 'CURSOR1', path: '/api/v1/stores/01STORE/contact-exports' },
        links: { next: 'https://example.test/next' },
      }),
      'GET /api/v1/stores/01STORE/contact-exports?cursor=CURSOR1&limit=25': jsonResponse(200, {
        data: [{ id: '01EXP2', status: 'failed', download_available: false }],
        meta: { next_cursor: null },
        links: {},
      }),
    })

    const first = await listStoreContactExports('01STORE', { limit: 25 }, { fetchFn })
    assert.equal(first.data.length, 1)
    assert.equal(first.nextCursor, 'CURSOR1')

    const second = await listStoreContactExports(
      '01STORE',
      { cursor: 'CURSOR1', limit: 25 },
      { fetchFn },
    )
    assert.equal(second.data[0].id, '01EXP2')
    assert.equal(second.nextCursor, null)
  })

  it('polls until completed', async () => {
    let polls = 0
    const fetchFn = createFetchMock({
      'GET /api/v1/contact-exports/01EXP': () => {
        polls += 1
        if (polls === 1) {
          return jsonResponse(200, {
            data: {
              id: '01EXP',
              status: 'processing',
              processed_rows: 10,
              total_rows: 0,
              download_available: false,
            },
          })
        }
        return jsonResponse(200, {
          data: {
            id: '01EXP',
            status: 'completed',
            processed_rows: 10,
            total_rows: 10,
            download_available: true,
            expires_at: '2099-01-01T00:00:00.000000Z',
          },
        })
      },
    })

    const result = await pollContactExport('01EXP', {
      fetchFn,
      intervalMs: 1,
      maxAttempts: 5,
      sleepFn: async () => {},
    })
    assert.equal(result.status, 'completed')
    assert.equal(result.download_available, true)
    assert.equal(polls, 2)
    assert.equal(isExportTerminal('processing'), false)
    assert.equal(isExportTerminal('completed'), true)
  })

  it('surfaces failed export status from show', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/contact-exports/01EXP': jsonResponse(200, {
        data: {
          id: '01EXP',
          status: 'failed',
          error_summary: 'Export aborted: RuntimeException — boom',
          download_available: false,
        },
      }),
    })

    const result = await getContactExport('01EXP', { fetchFn })
    assert.equal(result.status, 'failed')
    assert.match(result.error_summary, /boom/)
    assert.equal(canDownloadExport(result), false)
  })

  it('downloads CSV blob with safe filename from Content-Disposition', async () => {
    const csv = 'id,email\n1,a@example.com\n'
    const fetchFn = createFetchMock({
      'GET /api/v1/contact-exports/01EXP/download': () =>
        new Response(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=UTF-8',
            'Content-Disposition': 'attachment; filename="contacts-export-safe.csv"',
          },
        }),
    })

    const { blob, filename } = await downloadContactExport('01EXP', {
      fetchFn,
      filenameHint: 'hint.csv',
    })
    assert.equal(filename, 'contacts-export-safe.csv')
    assert.equal(await blob.text(), csv)
  })

  it('maps expired and missing download errors', async () => {
    const expiredFetch = createFetchMock({
      'GET /api/v1/contact-exports/01EXP/download': jsonResponse(410, {
        message: 'This export has expired.',
      }),
    })
    await assert.rejects(
      () => downloadContactExport('01EXP', { fetchFn: expiredFetch }),
      (error) => error instanceof ApiError && error.status === 410,
    )

    const missingFetch = createFetchMock({
      'GET /api/v1/contact-exports/01EXP/download': jsonResponse(404, {
        message: 'The export file is no longer available.',
      }),
    })
    await assert.rejects(
      () => downloadContactExport('01EXP', { fetchFn: missingFetch }),
      (error) => error instanceof ApiError && error.status === 404,
    )
  })

  it('rejects missing ids before network and formats helpers', async () => {
    let called = false
    const fetchFn = async () => {
      called = true
      return jsonResponse(200, { data: {} })
    }
    await assert.rejects(
      () => startContactExport('', {}, { fetchFn }),
      (error) => error instanceof ApiError,
    )
    await assert.rejects(() => getContactExport('', { fetchFn }), (error) => error instanceof ApiError)
    assert.equal(called, false)

    assert.equal(resolveExportFilename(null, 'report'), 'report.csv')
    assert.equal(isExportExpired({ expires_at: '2000-01-01T00:00:00Z' }), true)
    assert.equal(isExportExpired({ expires_at: '2099-01-01T00:00:00Z' }), false)
    assert.equal(formatExportFilters({ q: 'a', tag: 'vip' }), 'Search: a · Tag: vip')
    assert.equal(formatExportFilters({}), 'All contacts')
  })

  it('propagates API errors from start/list', async () => {
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/contact-exports': jsonResponse(422, {
        message: 'The consent email field is invalid.',
        errors: { consent_email: ['The selected consent email is invalid.'] },
      }),
      'GET /api/v1/stores/01STORE/contact-exports?limit=25': jsonResponse(500, {
        message: 'Server error',
      }),
    })

    await assert.rejects(
      () => startContactExport('01STORE', { consent_email: 'nope' }, { fetchFn }),
      (error) => error instanceof ApiError && error.status === 422,
    )
    await assert.rejects(
      () => listStoreContactExports('01STORE', {}, { fetchFn }),
      (error) => error instanceof ApiError && error.status === 500,
    )
  })
})
