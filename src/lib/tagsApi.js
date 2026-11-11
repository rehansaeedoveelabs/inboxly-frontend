import { ApiError } from './api.js'
import {
  assertAudienceOk,
  audienceFetch,
  audienceResourcePath,
  readAudienceCollection,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * Tags API — Laravel TagController contracts via Audience helpers.
 *
 * List/create: GET|POST /api/v1/stores/{store}/tags
 * Update/delete: PUT|DELETE /api/v1/tags/{tag}
 * Resource: { id, store_id, name, slug, color, created_at, updated_at }
 */

/**
 * @param {string | null | undefined} tagId
 * @returns {string}
 */
function requireTagId(tagId) {
  if (typeof tagId !== 'string' || tagId.trim() === '') {
    throw new ApiError('A tag id is required.', { status: 422 })
  }
  return tagId.trim()
}

/**
 * @param {{ name?: string, color?: string | null }} payload
 * @param {{ requireName?: boolean }} [options]
 */
function tagBody(payload, { requireName = false } = {}) {
  const body = {}
  if (payload.name !== undefined) {
    body.name = payload.name
  } else if (requireName) {
    throw new ApiError('Tag name is required.', { status: 422 })
  }
  if (payload.color !== undefined) {
    body.color = payload.color
  }
  return body
}

/**
 * GET /api/v1/stores/{store}/tags → { data: TagResource[] }
 *
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<object[]>}
 */
export async function listStoreTags(storeId, deps = {}) {
  const path = storeAudiencePath(storeId, 'tags')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load tags.')
  return readAudienceCollection(response, 'tags')
}

/**
 * POST /api/v1/stores/{store}/tags → 201 { data: TagResource }
 *
 * @param {string} storeId
 * @param {{ name: string, color?: string | null }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<object>}
 */
export async function createStoreTag(storeId, payload, deps = {}) {
  const path = storeAudiencePath(storeId, 'tags')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagBody(payload, { requireName: true })),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to create the tag.')
  return readAudienceResource(response, 'tag')
}

/**
 * PUT /api/v1/tags/{tag} → { data: TagResource }
 * Renaming keeps slug stable on the backend.
 *
 * @param {string} tagId
 * @param {{ name?: string, color?: string | null }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<object>}
 */
export async function updateTag(tagId, payload, deps = {}) {
  const id = requireTagId(tagId)
  const path = audienceResourcePath('tags', id)
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagBody(payload)),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to update the tag.')
  return readAudienceResource(response, 'tag')
}

/**
 * DELETE /api/v1/tags/{tag} → 204
 *
 * @param {string} tagId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<void>}
 */
export async function deleteTag(tagId, deps = {}) {
  const id = requireTagId(tagId)
  const path = audienceResourcePath('tags', id)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to delete the tag.')
}
