import { apiFetch, readJsonSafe, toApiError } from '../lib/api.js'

/**
 * @param {Response} response
 */
async function readUser(response) {
  const payload = await readJsonSafe(response)
  const user = payload?.data
  if (!user || typeof user !== 'object' || !user.id) {
    throw new Error('Invalid authentication response.')
  }
  return user
}

/**
 * @param {{ email: string, password: string, remember?: boolean }} credentials
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function loginRequest(credentials, deps = {}) {
  const response = await apiFetch(
    '/api/v1/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        remember: Boolean(credentials.remember),
      }),
    },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to sign in with those credentials.')
  }

  return readUser(response)
}

/**
 * @param {{
 *   name: string,
 *   email: string,
 *   password: string,
 *   password_confirmation: string,
 *   workspace_name?: string,
 * }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function registerRequest(payload, deps = {}) {
  const body = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
  }
  if (payload.workspace_name) {
    body.workspace_name = payload.workspace_name
  }

  const response = await apiFetch(
    '/api/v1/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to create your account.')
  }

  return readUser(response)
}

/**
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<object | null>} user or null if unauthenticated
 */
export async function fetchCurrentUser(deps = {}) {
  const response = await apiFetch('/api/v1/auth/me', { method: 'GET' }, deps)

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw await toApiError(response, 'Unable to restore your session.')
  }

  return readUser(response)
}

/**
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function logoutRequest(deps = {}) {
  const response = await apiFetch('/api/v1/auth/logout', { method: 'POST' }, deps)

  if (response.status === 401) {
    return
  }

  if (!response.ok && response.status !== 204) {
    throw await toApiError(response, 'Unable to sign out.')
  }
}
