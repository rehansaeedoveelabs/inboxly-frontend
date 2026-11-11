/**
 * Minimal Sanctum SPA client for same-origin Vite → Laravel proxy.
 * Cookies only — no tokens in localStorage.
 */

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, body?: unknown, errors?: Record<string, string[]> }} [meta]
   */
  constructor(message, meta = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = meta.status
    this.body = meta.body
    this.errors = meta.errors ?? null
  }
}

/**
 * @param {string} [cookieString]
 * @returns {string | null}
 */
export function readXsrfToken(cookieString = typeof document !== 'undefined' ? document.cookie : '') {
  const match = cookieString.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * @param {typeof fetch} [fetchFn]
 */
export async function ensureCsrfCookie(fetchFn = fetch) {
  const response = await fetchFn('/sanctum/csrf-cookie', {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  if (!response.ok && response.status !== 204) {
    throw new ApiError('Could not initialize the secure session cookie.', {
      status: response.status,
    })
  }
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function apiFetch(path, options = {}, deps = {}) {
  const fetchFn = deps.fetchFn ?? fetch
  await ensureCsrfCookie(fetchFn)

  const headers = new Headers(options.headers ?? {})
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')

  const xsrf = readXsrfToken(deps.cookieString)
  if (xsrf) headers.set('X-XSRF-TOKEN', xsrf)

  return fetchFn(path, {
    ...options,
    credentials: 'include',
    headers,
  })
}

/**
 * @param {Response} response
 */
export async function readJsonSafe(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

/**
 * Turn a Laravel JSON error into ApiError without exposing internals.
 * @param {Response} response
 * @param {string} fallback
 */
export async function toApiError(response, fallback = 'Something went wrong. Please try again.') {
  const body = await readJsonSafe(response)
  const errors = body?.errors && typeof body.errors === 'object' ? body.errors : null

  if (response.status === 422) {
    const firstFieldError = errors
      ? Object.values(errors)
          .flat()
          .find(Boolean)
      : null
    const message =
      (typeof firstFieldError === 'string' && firstFieldError) ||
      (typeof body?.message === 'string' && body.message) ||
      'Please check the form and try again.'
    return new ApiError(message, { status: 422, body, errors })
  }

  if (response.status === 401) {
    return new ApiError('Sign in to continue.', { status: 401, body, errors })
  }

  if (response.status === 403) {
    return new ApiError('You do not have permission to do that.', { status: 403, body, errors })
  }

  if (response.status === 429) {
    return new ApiError('Too many attempts. Please wait and try again.', {
      status: 429,
      body,
      errors,
    })
  }

  const safeMessage =
    typeof body?.message === 'string' &&
    body.message.length < 180 &&
    !/exception|stack|sql|trace|session store/i.test(body.message)
      ? body.message
      : fallback

  return new ApiError(safeMessage, { status: response.status, body, errors })
}
