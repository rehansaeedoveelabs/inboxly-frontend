import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError, ensureCsrfCookie, readXsrfToken, toApiError } from './api.js'

describe('api client', () => {
  it('reads the XSRF-TOKEN cookie', () => {
    assert.equal(readXsrfToken('XSRF-TOKEN=abc%3D123; other=1'), 'abc=123')
    assert.equal(readXsrfToken(''), null)
  })

  it('requests the Sanctum csrf cookie with credentials', async () => {
    const calls = []
    const fetchFn = async (url, options) => {
      calls.push({ url, options })
      return new Response(null, { status: 204 })
    }

    await ensureCsrfCookie(fetchFn)

    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, '/sanctum/csrf-cookie')
    assert.equal(calls[0].options.credentials, 'include')
    assert.equal(calls[0].options.method, 'GET')
  })

  it('maps 422 validation errors without leaking internals', async () => {
    const response = new Response(
      JSON.stringify({
        message: 'The given data was invalid.',
        errors: { email: ['The email has already been taken.'] },
      }),
      { status: 422, headers: { 'Content-Type': 'application/json' } },
    )

    const error = await toApiError(response)
    assert.ok(error instanceof ApiError)
    assert.equal(error.status, 422)
    assert.equal(error.message, 'The email has already been taken.')
    assert.deepEqual(error.errors.email, ['The email has already been taken.'])
  })

  it('sanitizes exception-like error messages', async () => {
    const response = new Response(
      JSON.stringify({ message: 'SQLSTATE[HY000] stack exception trace' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )

    const error = await toApiError(response, 'Safe fallback')
    assert.equal(error.message, 'Safe fallback')
  })
})
