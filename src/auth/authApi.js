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
 *   phone: string,
 *   shop_name: string,
 *   password: string,
 *   password_confirmation: string,
 *   workspace_name?: string,
 * }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<{ user: object, email_otp_required: boolean }>}
 */
export async function registerRequest(payload, deps = {}) {
  const body = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    shop_name: payload.shop_name,
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

  const json = await readJsonSafe(response)
  const user = json?.data
  if (!user || typeof user !== 'object' || !user.id) {
    throw new Error('Invalid authentication response.')
  }

  return {
    user,
    email_otp_required: json?.meta?.email_otp_required !== false,
  }
}

/**
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function sendEmailOtpRequest(deps = {}) {
  const response = await apiFetch('/api/v1/auth/email/otp/send', { method: 'POST' }, deps)

  if (!response.ok) {
    throw await toApiError(response, 'Unable to send verification code.')
  }

  return readJsonSafe(response)
}

/**
 * @param {string} code
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<{ user: object, shopify_authorize_url: string }>}
 */
export async function verifyEmailOtpRequest(code, deps = {}) {
  const response = await apiFetch(
    '/api/v1/auth/email/otp/verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to verify that code.')
  }

  const json = await readJsonSafe(response)
  const user = json?.data?.user
  const authorizeUrl = json?.data?.shopify_authorize_url
  if (!user || typeof user !== 'object' || !user.id) {
    throw new Error('Invalid OTP verification response.')
  }
  if (typeof authorizeUrl !== 'string' || authorizeUrl === '') {
    throw new Error('Shopify authorize URL missing from OTP verification response.')
  }

  return { user, shopify_authorize_url: authorizeUrl }
}

/**
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<string>}
 */
export async function startShopifyInstallRequest(deps = {}) {
  const response = await apiFetch(
    '/api/v1/shopify/oauth/install?json=1',
    { method: 'GET' },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to start Shopify install.')
  }

  const json = await readJsonSafe(response)
  const url = json?.data?.authorize_url
  if (typeof url !== 'string' || url === '') {
    throw new Error('Invalid Shopify install response.')
  }
  return url
}

/**
 * @param {Record<string, string>} query
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<string>}
 */
export async function continueShopifyInstallRequest(query, deps = {}) {
  const params = new URLSearchParams()
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value != null && value !== '') params.set(key, String(value))
  })

  const response = await apiFetch(
    `/api/v1/shopify/oauth/continue?${params.toString()}`,
    { method: 'GET' },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to continue Shopify install.')
  }

  const json = await readJsonSafe(response)
  const url = json?.data?.authorize_url
  if (typeof url !== 'string' || url === '') {
    throw new Error('Invalid Shopify continue response.')
  }
  return url
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

/**
 * PUT /api/v1/auth/profile
 * @param {{ name?: string, email?: string }} payload
 */
export async function updateProfileRequest(payload, deps = {}) {
  const response = await apiFetch(
    '/api/v1/auth/profile',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    deps,
  )
  if (!response.ok) {
    throw await toApiError(response, 'Unable to update your profile.')
  }
  return readUser(response)
}

/**
 * PUT /api/v1/auth/password → 204
 * @param {{ current_password: string, password: string, password_confirmation: string }} payload
 */
export async function updatePasswordRequest(payload, deps = {}) {
  const response = await apiFetch(
    '/api/v1/auth/password',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    deps,
  )
  if (!response.ok && response.status !== 204) {
    throw await toApiError(response, 'Unable to update your password.')
  }
}
