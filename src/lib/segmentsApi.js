import { ApiError } from './api.js'
import {
  assertAudienceOk,
  audienceFetch,
  audienceResourcePath,
  readAudienceCollection,
  readAudienceJson,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * Segments API — Laravel SegmentController contracts.
 *
 * List/create: GET|POST /api/v1/stores/{store}/segments
 * Show/update/delete: GET|PUT|DELETE /api/v1/segments/{segment}
 * Preview: POST /api/v1/segments/{segment}/preview → { count, sample }
 */

function requireSegmentId(segmentId) {
  if (typeof segmentId !== 'string' || segmentId.trim() === '') {
    throw new ApiError('A segment id is required.', { status: 422 })
  }
  return segmentId.trim()
}

/**
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function listStoreSegments(storeId, deps = {}) {
  const path = storeAudiencePath(storeId, 'segments')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load segments.')
  return readAudienceCollection(response, 'segments')
}

/**
 * @param {string} storeId
 * @param {{ name: string, description?: string | null, rules: object }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function createStoreSegment(storeId, payload, deps = {}) {
  const path = storeAudiencePath(storeId, 'segments')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to create the segment.')
  return readAudienceResource(response, 'segment')
}

/**
 * @param {string} segmentId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getSegment(segmentId, deps = {}) {
  const id = requireSegmentId(segmentId)
  const path = audienceResourcePath('segments', id)
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the segment.')
  return readAudienceResource(response, 'segment')
}

/**
 * @param {string} segmentId
 * @param {{ name?: string, description?: string | null, rules?: object }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function updateSegment(segmentId, payload, deps = {}) {
  const id = requireSegmentId(segmentId)
  const path = audienceResourcePath('segments', id)
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to update the segment.')
  return readAudienceResource(response, 'segment')
}

/**
 * @param {string} segmentId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function deleteSegment(segmentId, deps = {}) {
  const id = requireSegmentId(segmentId)
  const path = audienceResourcePath('segments', id)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to delete the segment.')
}

/**
 * Live membership preview — never invents counts.
 * @param {string} segmentId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<{ count: number, sample: object[] }>}
 */
export async function previewSegment(segmentId, deps = {}) {
  const id = requireSegmentId(segmentId)
  const path = audienceResourcePath('segments', id, 'preview')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to preview the segment.')
  const payload = await readAudienceJson(response)
  const count = typeof payload.count === 'number' ? payload.count : null
  const sample = Array.isArray(payload.sample) ? payload.sample : null
  if (count === null || sample === null) {
    throw new ApiError('Invalid segment preview response.', {
      status: response.status,
      body: payload,
    })
  }
  return { count, sample }
}
