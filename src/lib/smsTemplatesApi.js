import { ApiError } from './api.js'
import {
  assertAudienceOk,
  audienceFetch,
  audienceResourcePath,
  buildAudienceQuery,
  readAudienceCursorPage,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * SMS templates — Laravel SmsTemplateController.
 *
 * List/create: /api/v1/stores/{store}/sms-templates
 * Show/update/delete/duplicate: /api/v1/sms-templates/{id}[…]
 */

/**
 * @param {string | null | undefined} templateId
 * @returns {string}
 */
function requireTemplateId(templateId) {
  if (typeof templateId !== 'string' || templateId.trim() === '') {
    throw new ApiError('A template id is required.', { status: 422 })
  }
  return templateId.trim()
}

/**
 * @param {string} storeId
 * @param {{
 *   q?: string | null,
 *   category?: string | null,
 *   status?: string | null,
 *   cursor?: string | null,
 *   limit?: number,
 * }} [params]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function listStoreSmsTemplates(storeId, params = {}, deps = {}) {
  const query = buildAudienceQuery({
    q: params.q,
    category: params.category,
    status: params.status,
    cursor: params.cursor,
    limit: params.limit ?? 25,
  })
  const path = `${storeAudiencePath(storeId, 'sms-templates')}${query}`
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load SMS templates.')
  return readAudienceCursorPage(response)
}

/**
 * @param {string} storeId
 * @param {{
 *   name: string,
 *   category?: string | null,
 *   status?: string,
 *   body: string,
 * }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function createStoreSmsTemplate(storeId, payload, deps = {}) {
  const body = {
    name: payload.name,
    body: payload.body,
  }
  if (payload.category != null) body.category = payload.category
  if (payload.status) body.status = payload.status

  const path = storeAudiencePath(storeId, 'sms-templates')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to create the SMS template.')
  return readAudienceResource(response, 'SMS template')
}

/**
 * @param {string} templateId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getSmsTemplate(templateId, deps = {}) {
  const id = requireTemplateId(templateId)
  const path = audienceResourcePath('sms-templates', id)
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the SMS template.')
  return readAudienceResource(response, 'SMS template')
}

/**
 * @param {string} templateId
 * @param {{
 *   name?: string,
 *   category?: string | null,
 *   status?: string,
 *   body?: string,
 * }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function updateSmsTemplate(templateId, payload, deps = {}) {
  const id = requireTemplateId(templateId)
  const body = {}
  if (typeof payload.name === 'string') body.name = payload.name
  if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
    body.category = payload.category
  }
  if (typeof payload.status === 'string') body.status = payload.status
  if (typeof payload.body === 'string') body.body = payload.body

  const path = audienceResourcePath('sms-templates', id)
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to update the SMS template.')
  return readAudienceResource(response, 'SMS template')
}

/**
 * @param {string} templateId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function deleteSmsTemplate(templateId, deps = {}) {
  const id = requireTemplateId(templateId)
  const path = audienceResourcePath('sms-templates', id)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to delete the SMS template.')
}

/**
 * @param {string} templateId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function duplicateSmsTemplate(templateId, deps = {}) {
  const id = requireTemplateId(templateId)
  const path = audienceResourcePath('sms-templates', id, 'duplicate')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to duplicate the SMS template.')
  return readAudienceResource(response, 'SMS template')
}
