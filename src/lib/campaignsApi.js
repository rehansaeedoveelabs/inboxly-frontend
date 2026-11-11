import { ApiError } from './api.js'
import {
  assertAudienceOk,
  audienceFetch,
  audienceResourcePath,
  buildAudienceQuery,
  readAudienceCursorPage,
  readAudienceJson,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * Campaigns API — Laravel CampaignController contracts.
 *
 * List/create: GET|POST /api/v1/stores/{store}/campaigns
 * Summary:     GET  /api/v1/stores/{store}/campaigns/summary → { total, draft, scheduled }
 * Preview:     POST /api/v1/stores/{store}/campaigns/audience-preview → { count }
 * Show/update/delete: GET|PUT|DELETE /api/v1/campaigns/{id}
 * Schedule / unschedule / duplicate: POST /api/v1/campaigns/{id}/…
 */

/**
 * @param {string | null | undefined} campaignId
 * @returns {string}
 */
function requireCampaignId(campaignId) {
  if (typeof campaignId !== 'string' || campaignId.trim() === '') {
    throw new ApiError('A campaign id is required.', { status: 422 })
  }
  return campaignId.trim()
}

/**
 * @param {{
 *   name?: string,
 *   channel?: string,
 *   subject?: string | null,
 *   preview_text?: string | null,
 *   body?: string | null,
 *   content_document?: object | null,
 *   audience_type?: string,
 *   segment_id?: string | null,
 * }} payload
 */
function campaignWriteBody(payload = {}) {
  const body = {}
  if (typeof payload.name === 'string') body.name = payload.name.trim()
  if (typeof payload.channel === 'string' && payload.channel.trim() !== '') {
    body.channel = payload.channel.trim()
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'subject')) {
    body.subject = typeof payload.subject === 'string' ? payload.subject : payload.subject
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'preview_text')) {
    body.preview_text =
      typeof payload.preview_text === 'string' ? payload.preview_text : payload.preview_text
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'body')) {
    body.body = typeof payload.body === 'string' ? payload.body : payload.body
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'content_document')) {
    body.content_document = payload.content_document
  }
  if (typeof payload.audience_type === 'string' && payload.audience_type.trim() !== '') {
    body.audience_type = payload.audience_type.trim()
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'segment_id')) {
    body.segment_id =
      typeof payload.segment_id === 'string' && payload.segment_id.trim() !== ''
        ? payload.segment_id.trim()
        : null
  }
  return body
}

/**
 * GET /api/v1/stores/{store}/campaigns
 *
 * @param {string} storeId
 * @param {{
 *   q?: string | null,
 *   status?: string | null,
 *   channel?: string | null,
 *   cursor?: string | null,
 *   limit?: number,
 * }} [params]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function listStoreCampaigns(storeId, params = {}, deps = {}) {
  const query = buildAudienceQuery({
    q: params.q,
    status: params.status,
    channel: params.channel,
    cursor: params.cursor,
    limit: params.limit ?? 25,
  })
  const path = `${storeAudiencePath(storeId, 'campaigns')}${query}`
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load campaigns.')
  return readAudienceCursorPage(response)
}

/**
 * GET /api/v1/stores/{store}/campaigns/summary
 *
 * @param {string} storeId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<{
 *   total: number,
 *   draft: number,
 *   scheduled: number,
 *   sending?: number,
 *   sent?: number,
 *   failed?: number,
 * }>}
 */
export async function getCampaignsSummary(storeId, deps = {}) {
  const path = storeAudiencePath(storeId, 'campaigns/summary')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load campaign summary.')
  const payload = await readAudienceJson(response)
  const total = typeof payload.total === 'number' ? payload.total : null
  const draft = typeof payload.draft === 'number' ? payload.draft : null
  const scheduled = typeof payload.scheduled === 'number' ? payload.scheduled : null
  if (total === null || draft === null || scheduled === null) {
    throw new ApiError('Invalid campaign summary response.', {
      status: response.status,
      body: payload,
    })
  }
  return {
    total,
    draft,
    scheduled,
    sending: typeof payload.sending === 'number' ? payload.sending : 0,
    sent: typeof payload.sent === 'number' ? payload.sent : 0,
    failed: typeof payload.failed === 'number' ? payload.failed : 0,
  }
}

/**
 * POST /api/v1/stores/{store}/campaigns/audience-preview
 *
 * @param {string} storeId
 * @param {{
 *   channel: string,
 *   audience_type: string,
 *   segment_id?: string | null,
 * }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<{ count: number }>}
 */
export async function previewCampaignAudience(storeId, payload, deps = {}) {
  const body = {
    channel: payload.channel,
    audience_type: payload.audience_type,
  }
  if (payload.audience_type === 'segment') {
    body.segment_id = payload.segment_id
  }

  const path = storeAudiencePath(storeId, 'campaigns/audience-preview')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to preview the campaign audience.')
  const result = await readAudienceJson(response)
  if (typeof result.count !== 'number') {
    throw new ApiError('Invalid campaign audience preview response.', {
      status: response.status,
      body: result,
    })
  }
  return { count: result.count }
}

/**
 * POST /api/v1/stores/{store}/campaigns
 *
 * @param {string} storeId
 * @param {object} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function createStoreCampaign(storeId, payload, deps = {}) {
  const path = storeAudiencePath(storeId, 'campaigns')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignWriteBody(payload)),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to create the campaign.')
  return readAudienceResource(response, 'campaign')
}

/**
 * GET /api/v1/campaigns/{id}
 *
 * @param {string} campaignId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getCampaign(campaignId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id)
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the campaign.')
  return readAudienceResource(response, 'campaign')
}

/**
 * PUT /api/v1/campaigns/{id}
 *
 * @param {string} campaignId
 * @param {object} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function updateCampaign(campaignId, payload, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id)
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignWriteBody(payload)),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to update the campaign.')
  return readAudienceResource(response, 'campaign')
}

/**
 * DELETE /api/v1/campaigns/{id}
 *
 * @param {string} campaignId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function deleteCampaign(campaignId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to delete the campaign.')
}

/**
 * POST /api/v1/campaigns/{id}/schedule
 *
 * @param {string} campaignId
 * @param {{ scheduled_at: string }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function scheduleCampaign(campaignId, payload, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id, 'schedule')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at: payload.scheduled_at }),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to schedule the campaign.')
  return readAudienceResource(response, 'campaign')
}

/**
 * POST /api/v1/campaigns/{id}/unschedule
 *
 * @param {string} campaignId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function unscheduleCampaign(campaignId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id, 'unschedule')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to unschedule the campaign.')
  return readAudienceResource(response, 'campaign')
}

/**
 * POST /api/v1/campaigns/{id}/duplicate
 *
 * @param {string} campaignId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function duplicateCampaign(campaignId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id, 'duplicate')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to duplicate the campaign.')
  return readAudienceResource(response, 'campaign')
}

/**
 * POST /api/v1/campaigns/{id}/apply-template
 * Snapshots template document/html onto a draft email campaign.
 *
 * @param {string} campaignId
 * @param {{ email_template_id: string }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function applyCampaignTemplate(campaignId, payload, deps = {}) {
  const id = requireCampaignId(campaignId)
  const templateId =
    typeof payload?.email_template_id === 'string' ? payload.email_template_id.trim() : ''
  if (!templateId) {
    throw new ApiError('An email template id is required.', { status: 422 })
  }
  const path = audienceResourcePath('campaigns', id, 'apply-template')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_template_id: templateId }),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to apply the email template.')
  return readAudienceResource(response, 'campaign')
}

/**
 * POST /api/v1/campaigns/{id}/send
 *
 * @param {string} campaignId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function sendCampaign(campaignId, deps = {}) {
  const id = requireCampaignId(campaignId)
  const path = audienceResourcePath('campaigns', id, 'send')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to send the campaign.')
  return readAudienceResource(response, 'campaign')
}

/**
 * POST /api/v1/campaigns/{id}/test-send
 *
 * @param {string} campaignId
 * @param {{ to?: string | null }} [payload]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function testSendCampaign(campaignId, payload = {}, deps = {}) {
  const id = requireCampaignId(campaignId)
  const body = {}
  if (typeof payload.to === 'string' && payload.to.trim() !== '') {
    body.to = payload.to.trim()
  }
  const path = audienceResourcePath('campaigns', id, 'test-send')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to send the test email.')
  const result = await readAudienceJson(response)
  const data = result?.data
  if (!data || typeof data !== 'object') {
    throw new ApiError('Invalid test-send response.', { status: response.status, body: result })
  }
  return data
}

/**
 * Human-readable audience label for list/detail when segment names are known.
 *
 * @param {{ audience_type?: string | null, segment_id?: string | null }} campaign
 * @param {Map<string, string> | Record<string, string> | null | undefined} [segmentNames]
 */
export function formatCampaignAudience(campaign, segmentNames) {
  if (campaign?.audience_type === 'all_eligible') return 'All eligible contacts'
  if (campaign?.audience_type === 'segment') {
    const id = campaign.segment_id
    if (id && segmentNames) {
      const name =
        segmentNames instanceof Map ? segmentNames.get(id) : segmentNames[id]
      if (name) return name
    }
    return 'Segment'
  }
  return '—'
}
