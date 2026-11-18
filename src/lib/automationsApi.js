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
 * Automations API — Laravel AutomationController contracts.
 *
 * List/create: GET|POST /api/v1/stores/{store}/automations
 * Summary:     GET  /api/v1/stores/{store}/automations/summary
 * Show/update: GET|PUT /api/v1/automations/{id}
 * Activate/pause/archive: POST /api/v1/automations/{id}/…
 * Enrollments: GET /api/v1/automations/{id}/enrollments
 */

/**
 * @param {string | null | undefined} automationId
 * @returns {string}
 */
function requireAutomationId(automationId) {
  if (typeof automationId !== 'string' || automationId.trim() === '') {
    throw new ApiError('An automation id is required.', { status: 422 })
  }
  return automationId.trim()
}

/**
 * @param {{
 *   name?: string,
 *   trigger_type?: string,
 *   steps?: Array<{ type: string, config?: Record<string, unknown> }>,
 * }} payload
 */
function automationWriteBody(payload = {}) {
  const body = {}
  if (typeof payload.name === 'string') body.name = payload.name.trim()
  if (typeof payload.trigger_type === 'string' && payload.trigger_type.trim() !== '') {
    body.trigger_type = payload.trigger_type.trim()
  }
  if (Array.isArray(payload.steps)) {
    body.steps = payload.steps.map((step) => ({
      type: step.type,
      config: step.config && typeof step.config === 'object' ? step.config : {},
    }))
  }
  return body
}

/**
 * @param {string} storeId
 * @param {{ q?: string, status?: string, limit?: number, cursor?: string }} [params]
 */
export async function listStoreAutomations(storeId, params = {}) {
  const path = storeAudiencePath(storeId, 'automations')
  const query = buildAudienceQuery(params)
  const response = await audienceFetch(query ? `${path}?${query}` : path)
  assertAudienceOk(response, 'Unable to load automations.')
  return readAudienceCursorPage(response)
}

/**
 * @param {string} storeId
 */
export async function getAutomationsSummary(storeId) {
  const path = storeAudiencePath(storeId, 'automations/summary')
  const response = await audienceFetch(path)
  assertAudienceOk(response, 'Unable to load automation summary.')
  return readAudienceJson(response)
}

/**
 * @param {string} storeId
 * @param {{ name: string, trigger_type?: string, steps?: Array<object> }} payload
 */
export async function createStoreAutomation(storeId, payload) {
  const path = storeAudiencePath(storeId, 'automations')
  const response = await audienceFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(automationWriteBody(payload)),
  })
  assertAudienceOk(response, 'Unable to create automation.')
  return readAudienceResource(response)
}

/**
 * @param {string} automationId
 */
export async function getAutomation(automationId) {
  const id = requireAutomationId(automationId)
  const path = audienceResourcePath('automations', id)
  const response = await audienceFetch(path)
  assertAudienceOk(response, 'Unable to load automation.')
  return readAudienceResource(response)
}

/**
 * @param {string} automationId
 * @param {{ name?: string, steps?: Array<object> }} payload
 */
export async function updateAutomation(automationId, payload) {
  const id = requireAutomationId(automationId)
  const path = audienceResourcePath('automations', id)
  const response = await audienceFetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(automationWriteBody(payload)),
  })
  assertAudienceOk(response, 'Unable to update automation.')
  return readAudienceResource(response)
}

/**
 * @param {string} automationId
 */
export async function activateAutomation(automationId) {
  const id = requireAutomationId(automationId)
  const path = audienceResourcePath('automations', id, 'activate')
  const response = await audienceFetch(path, { method: 'POST' })
  assertAudienceOk(response, 'Unable to activate automation.')
  return readAudienceResource(response)
}

/**
 * @param {string} automationId
 */
export async function pauseAutomation(automationId) {
  const id = requireAutomationId(automationId)
  const path = audienceResourcePath('automations', id, 'pause')
  const response = await audienceFetch(path, { method: 'POST' })
  assertAudienceOk(response, 'Unable to pause automation.')
  return readAudienceResource(response)
}

/**
 * @param {string} automationId
 */
export async function archiveAutomation(automationId) {
  const id = requireAutomationId(automationId)
  const path = audienceResourcePath('automations', id, 'archive')
  const response = await audienceFetch(path, { method: 'POST' })
  assertAudienceOk(response, 'Unable to archive automation.')
  return readAudienceResource(response)
}

/**
 * @param {string} automationId
 * @param {{ limit?: number, cursor?: string }} [params]
 */
export async function listAutomationEnrollments(automationId, params = {}) {
  const id = requireAutomationId(automationId)
  const path = audienceResourcePath('automations', id, 'enrollments')
  const query = buildAudienceQuery(params)
  const response = await audienceFetch(query ? `${path}?${query}` : path)
  assertAudienceOk(response, 'Unable to load enrollment history.')
  return readAudienceCursorPage(response)
}

/**
 * Build linear automation steps for the editor (no visual canvas).
 * Optional condition is a simple if/else jump: true → next, false → end.
 *
 * @param {{
 *   delayMinutes?: number,
 *   subject?: string,
 *   body?: string,
 *   requireEmailSubscribed?: boolean,
 * }} [opts]
 */
export function defaultWelcomeSteps(opts = {}) {
  const delayMinutes = Number.isFinite(opts.delayMinutes) ? Math.max(0, opts.delayMinutes) : 0
  const subject = typeof opts.subject === 'string' && opts.subject.trim() !== '' ? opts.subject.trim() : 'Welcome'
  const body =
    typeof opts.body === 'string' && opts.body.trim() !== ''
      ? opts.body
      : 'Thanks for subscribing. We’re glad you’re here.'

  const steps = []
  if (opts.requireEmailSubscribed) {
    steps.push({
      type: 'condition',
      config: {
        predicate: 'email_subscribed',
        on_true_goto: 'next',
        on_false_goto: 'end',
      },
    })
  }
  if (delayMinutes > 0) {
    steps.push({ type: 'delay', config: { delay_minutes: delayMinutes } })
  }
  steps.push({ type: 'send_email', config: { subject, body } })
  return steps
}
