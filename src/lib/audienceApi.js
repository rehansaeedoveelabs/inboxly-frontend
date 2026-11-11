import { ApiError, apiFetch, readJsonSafe, toApiError } from './api.js'

/**
 * Audience API foundation — store-scoped Laravel `/api/v1` contracts.
 * Reuses Sanctum `apiFetch` (cookies + CSRF). Does not invent store IDs.
 */

/**
 * Require a real backend store ULID before any Audience request.
 * @param {string | null | undefined} storeId
 * @returns {string}
 */
export function requireStoreId(storeId) {
  if (typeof storeId !== 'string' || storeId.trim() === '') {
    throw new ApiError('Select a store before managing audience.', { status: 422 })
  }
  return storeId.trim()
}

/**
 * Resolve the active store id from ActiveStoreContext's `activeStore`.
 * @param {{ id?: string } | null | undefined} activeStore
 * @returns {string}
 */
export function requireActiveStoreId(activeStore) {
  return requireStoreId(activeStore?.id)
}

/**
 * Build `/api/v1/stores/{storeId}/...` paths.
 * @param {string} storeId
 * @param {string} [relativePath] e.g. `contacts`, `tags`, `segments`, `contact-imports`
 */
export function storeAudiencePath(storeId, relativePath = '') {
  const id = requireStoreId(storeId)
  const clean = String(relativePath || '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
  const base = `/api/v1/stores/${encodeURIComponent(id)}`
  return clean ? `${base}/${clean.split('/').map(encodeURIComponent).join('/')}` : base
}

/**
 * Build `/api/v1/{resource}/...` paths for resource-scoped Audience routes
 * (e.g. contacts/{id}, tags/{id}, segments/{id}, contact-imports/{id}).
 * @param {...string} segments
 */
export function audienceResourcePath(...segments) {
  const parts = segments
    .filter((segment) => segment !== undefined && segment !== null && String(segment) !== '')
    .map((segment) => encodeURIComponent(String(segment)))

  if (parts.length === 0) {
    throw new ApiError('Audience resource path is incomplete.', { status: 422 })
  }

  return `/api/v1/${parts.join('/')}`
}

/**
 * @param {Record<string, string | number | boolean | null | undefined>} [params]
 */
export function buildAudienceQuery(params = {}) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/**
 * Authenticated Audience fetch — same Sanctum client as the rest of the SPA.
 * Callers must build paths with {@link storeAudiencePath} / {@link audienceResourcePath}
 * so missing store IDs fail before a network request.
 *
 * @param {string} path
 * @param {RequestInit} [options]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function audienceFetch(path, options = {}, deps = {}) {
  if (typeof path !== 'string' || path.trim() === '') {
    throw new ApiError('Audience request path is required.', { status: 422 })
  }
  return apiFetch(path, options, deps)
}

/**
 * @param {Response} response
 * @param {string} fallback
 */
export async function assertAudienceOk(response, fallback) {
  if (!response.ok) {
    throw await toApiError(response, fallback)
  }
  return response
}

/**
 * Laravel JsonResource single payload: `{ data: object }`.
 * @param {Response} response
 * @param {string} [label]
 */
export async function readAudienceResource(response, label = 'resource') {
  const payload = await readJsonSafe(response)
  const data = payload?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError(`Invalid Audience ${label} response.`, {
      status: response.status,
      body: payload,
    })
  }
  return data
}

/**
 * Laravel Resource collection without pagination: `{ data: array }`.
 * @param {Response} response
 * @param {string} [label]
 */
export async function readAudienceCollection(response, label = 'collection') {
  const payload = await readJsonSafe(response)
  const data = payload?.data
  if (!Array.isArray(data)) {
    throw new ApiError(`Invalid Audience ${label} response.`, {
      status: response.status,
      body: payload,
    })
  }
  return data
}

/**
 * Laravel cursor-paginated collection (contacts index).
 * @param {Response} response
 * @returns {Promise<{ data: object[], meta: object, links: object, nextCursor: string | null }>}
 */
export async function readAudienceCursorPage(response) {
  const payload = await readJsonSafe(response)
  const data = payload?.data
  if (!Array.isArray(data)) {
    throw new ApiError('Invalid Audience cursor page response.', {
      status: response.status,
      body: payload,
    })
  }

  const meta = payload?.meta && typeof payload.meta === 'object' ? payload.meta : {}
  const links = payload?.links && typeof payload.links === 'object' ? payload.links : {}
  const nextCursor =
    typeof meta.next_cursor === 'string' && meta.next_cursor !== '' ? meta.next_cursor : null

  return { data, meta, links, nextCursor }
}

/**
 * Unwrapped JSON bodies (e.g. segment preview `{ count, sample }`).
 * @param {Response} response
 */
export async function readAudienceJson(response) {
  const payload = await readJsonSafe(response)
  if (payload === null || typeof payload !== 'object') {
    throw new ApiError('Invalid Audience JSON response.', {
      status: response.status,
      body: payload,
    })
  }
  return payload
}
