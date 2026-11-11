import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from '../lib/api.js'
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
} from './authApi.js'

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
    const handler = handlers[options.method || 'GET']?.[url] ?? handlers[url]
    if (!handler) {
      throw new Error(`Unexpected fetch: ${options.method || 'GET'} ${url}`)
    }
    return typeof handler === 'function' ? handler(url, options) : handler
  }
}

const sampleUser = {
  id: '01USER',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  workspaces: [{ id: '01WS', name: 'Ada Workspace', active_store_id: null }],
}

describe('authApi', () => {
  it('logs in against POST /api/v1/auth/login and returns UserResource data', async () => {
    let loginBody = null
    const fetchFn = createFetchMock({
      POST: {
        '/api/v1/auth/login': async (_url, options) => {
          loginBody = JSON.parse(options.body)
          return jsonResponse(200, { data: sampleUser })
        },
      },
    })

    const user = await loginRequest(
      { email: 'ada@example.com', password: 'secret-pass', remember: true },
      { fetchFn, cookieString: 'XSRF-TOKEN=token' },
    )

    assert.equal(loginBody.email, 'ada@example.com')
    assert.equal(loginBody.remember, true)
    assert.equal(user.id, '01USER')
    assert.equal(user.email, 'ada@example.com')
  })

  it('registers against POST /api/v1/auth/register', async () => {
    let registerBody = null
    const fetchFn = createFetchMock({
      POST: {
        '/api/v1/auth/register': async (_url, options) => {
          registerBody = JSON.parse(options.body)
          return jsonResponse(201, { data: sampleUser })
        },
      },
    })

    const user = await registerRequest(
      {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'secret-pass',
        password_confirmation: 'secret-pass',
        workspace_name: 'Ada Workspace',
      },
      { fetchFn, cookieString: 'XSRF-TOKEN=token' },
    )

    assert.equal(registerBody.workspace_name, 'Ada Workspace')
    assert.equal(user.name, 'Ada Lovelace')
  })

  it('surfaces login validation failures as ApiError', async () => {
    const fetchFn = createFetchMock({
      POST: {
        '/api/v1/auth/login': jsonResponse(422, {
          message: 'The given data was invalid.',
          errors: { email: ['These credentials do not match our records.'] },
        }),
      },
    })

    await assert.rejects(
      () =>
        loginRequest(
          { email: 'bad@example.com', password: 'nope' },
          { fetchFn, cookieString: 'XSRF-TOKEN=token' },
        ),
      (error) => {
        assert.ok(error instanceof ApiError)
        assert.equal(error.status, 422)
        assert.match(error.message, /credentials|email/i)
        return true
      },
    )
  })

  it('restores the session from GET /api/v1/auth/me', async () => {
    const fetchFn = createFetchMock({
      GET: {
        '/api/v1/auth/me': jsonResponse(200, { data: sampleUser }),
      },
    })

    const user = await fetchCurrentUser({ fetchFn, cookieString: 'XSRF-TOKEN=token' })
    assert.equal(user.id, '01USER')
  })

  it('returns null when session restoration is unauthenticated', async () => {
    const fetchFn = createFetchMock({
      GET: {
        '/api/v1/auth/me': new Response(null, { status: 401 }),
      },
    })

    const user = await fetchCurrentUser({ fetchFn, cookieString: 'XSRF-TOKEN=token' })
    assert.equal(user, null)
  })

  it('logs out through POST /api/v1/auth/logout', async () => {
    let logoutCalled = false
    const fetchFn = createFetchMock({
      POST: {
        '/api/v1/auth/logout': async () => {
          logoutCalled = true
          return new Response(null, { status: 204 })
        },
      },
    })

    await logoutRequest({ fetchFn, cookieString: 'XSRF-TOKEN=token' })
    assert.equal(logoutCalled, true)
  })
})
