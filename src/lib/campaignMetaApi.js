import { ApiError } from './api.js'
import {
  audienceFetch,
  audienceResourcePath,
  assertAudienceOk,
  readAudienceJson,
} from './audienceApi.js'

/**
 * GET /api/v1/campaigns/{id}/meta/eligible-pages
 * @param {string} campaignId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getCampaignMetaEligiblePages(campaignId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id, 'meta', 'eligible-pages')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load Facebook Pages for this campaign.')
  const result = await readAudienceJson(response)
  if (!result?.data || typeof result.data !== 'object') {
    throw new ApiError('Invalid eligible Pages response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * PUT /api/v1/campaigns/{id}/meta/social-content
 * @param {string} campaignId
 * @param {{ message?: string, link?: string | null, asset_id?: string | null }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function updateCampaignSocialContent(campaignId, payload, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id, 'meta', 'social-content')
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to save Facebook content.')
  const result = await readAudienceJson(response)
  if (!result?.data?.id) {
    throw new ApiError('Invalid social content response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * GET /api/v1/campaigns/{id}/meta/publications
 * @param {string} campaignId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function listCampaignMetaPublications(campaignId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id, 'meta', 'publications')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load Facebook publications.')
  const result = await readAudienceJson(response)
  if (!Array.isArray(result?.data)) {
    throw new ApiError('Invalid publications response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * POST /api/v1/campaigns/{id}/meta/publications
 * @param {string} campaignId
 * @param {{ metaPageIds: string[], confirmRepublish?: boolean }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function createCampaignMetaPublications(campaignId, payload, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id, 'meta', 'publications')
  const body = {
    meta_page_ids: payload.metaPageIds || [],
  }
  if (payload.confirmRepublish) {
    body.confirm_republish = true
  }
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to publish to Facebook.')
  const result = await readAudienceJson(response)
  if (!Array.isArray(result?.data)) {
    throw new ApiError('Invalid publish response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * POST .../meta/publications/{publicationId}/retry
 */
export async function retryCampaignMetaPublication(campaignId, publicationId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const pubId = requirePublicationId(publicationId)
  const path = audienceResourcePath('campaigns', id, 'meta', 'publications', pubId, 'retry')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to retry the Facebook publication.')
  const result = await readAudienceJson(response)
  if (!result?.data?.id) {
    throw new ApiError('Invalid retry response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * POST .../meta/publications/{publicationId}/reconcile
 */
export async function reconcileCampaignMetaPublication(campaignId, publicationId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const pubId = requirePublicationId(publicationId)
  const path = audienceResourcePath('campaigns', id, 'meta', 'publications', pubId, 'reconcile')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to reconcile the Facebook publication.')
  const result = await readAudienceJson(response)
  if (!result?.data?.id) {
    throw new ApiError('Invalid reconcile response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * POST .../meta/publications/{publicationId}/resolve
 * @param {string} campaignId
 * @param {string} publicationId
 * @param {{
 *   resolution: 'mark_published' | 'mark_failed',
 *   acknowledgeDuplicateRisk?: boolean,
 *   acknowledgeVerifiedOnFacebook?: boolean,
 *   providerPostId?: string | null
 * }} payload
 */
export async function resolveCampaignMetaPublication(campaignId, publicationId, payload, deps = {}) {
  const id = requireCampaignId(campaignId)
  const pubId = requirePublicationId(publicationId)
  const path = audienceResourcePath('campaigns', id, 'meta', 'publications', pubId, 'resolve')
  const body = {
    resolution: payload.resolution,
  }
  if (payload.acknowledgeDuplicateRisk) {
    body.acknowledge_duplicate_risk = true
  }
  if (payload.acknowledgeVerifiedOnFacebook) {
    body.acknowledge_verified_on_facebook = true
  }
  if (payload.providerPostId) {
    body.provider_post_id = payload.providerPostId
  }
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to resolve the Facebook publication.')
  const result = await readAudienceJson(response)
  if (!result?.data?.id) {
    throw new ApiError('Invalid resolve response.', { status: response.status, body: result })
  }
  return result.data
}

/**
 * Preview UTM append (mirrors backend MetaUtm rules for UX).
 * @param {string} url
 * @param {Record<string, string>} params
 */
export function appendUtmParams(url, params) {
  const value = String(url || '').trim()
  if (!value) return value
  try {
    const parsed = new URL(value)
    for (const [key, raw] of Object.entries(params || {})) {
      if (!key || raw == null || raw === '') continue
      if (!parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, String(raw))
      }
    }
    return parsed.toString()
  } catch {
    return value
  }
}

export function publicationStatusLabel(status) {
  switch (status) {
    case 'published':
      return 'Published'
    case 'queued':
      return 'Queued'
    case 'publishing':
      return 'Publishing'
    case 'failed':
      return 'Failed'
    case 'outcome_unknown':
      return 'Outcome unknown'
    case 'cancelled':
      return 'Cancelled'
    case 'draft':
      return 'Draft'
    default:
      return status || 'Unknown'
  }
}

/**
 * @param {string} campaignId
 */
function requireCampaignId(campaignId) {
  if (typeof campaignId !== 'string' || campaignId.trim() === '') {
    throw new ApiError('A campaign is required.', { status: 422 })
  }
  return campaignId.trim()
}

/**
 * @param {string} publicationId
 */
function requirePublicationId(publicationId) {
  if (typeof publicationId !== 'string' || publicationId.trim() === '') {
    throw new ApiError('A publication is required.', { status: 422 })
  }
  return publicationId.trim()
}
