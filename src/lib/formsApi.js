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
 * Forms API — Laravel FormController.
 *
 * List/create/summary: /api/v1/stores/{store}/forms[…]
 * Show/update/delete: /api/v1/forms/{id}
 */

/**
 * @param {string | null | undefined} formId
 * @returns {string}
 */
function requireFormId(formId) {
  if (typeof formId !== 'string' || formId.trim() === '') {
    throw new ApiError('A form id is required.', { status: 422 })
  }
  return formId.trim()
}

/** Default editor definition (matches backend FormDefinitionSchema). */
export function defaultFormDefinition() {
  return {
    headline: 'GET 10% OFF YOUR FIRST ORDER',
    subheadline: 'Join for drops, offers, and early access.',
    button_label: 'Subscribe',
    layout: 'stack',
    tags: ['form_subscriber'],
    fields: [
      { id: 'f_email', type: 'email', label: 'Email', required: true },
      {
        id: 'f_consent',
        type: 'consent',
        label: 'I agree to receive marketing emails',
        required: true,
      },
    ],
    theme: {
      accent: '#2878FF',
      background: '#FFFFFF',
      text: '#10131C',
    },
    behavior: {
      display: 'After spending 5 sec on the page',
      devices: 'Show on all devices',
      frequency: 'Show after 1 day',
      scheduling: 'Always available',
      targeting: 'All visitors',
      redirect: 'Stay on page',
    },
    success: {
      headline: "YOU'RE IN!",
      subheadline: 'Check your inbox for your offer.',
      button_label: 'Continue shopping',
    },
  }
}

const GAME_TYPES = new Set(['wheel', 'mystery', 'scratch', 'plinko', 'pick_card', 'countdown'])

/**
 * Map API form → editor-friendly shape.
 * @param {object} resource
 */
export function toFormEditorState(resource) {
  const definition =
    resource?.definition && typeof resource.definition === 'object'
      ? resource.definition
      : defaultFormDefinition()
  const defaults = defaultFormDefinition()
  const behavior = {
    ...defaults.behavior,
    ...(definition.behavior && typeof definition.behavior === 'object' ? definition.behavior : {}),
  }
  const success = {
    ...defaults.success,
    ...(definition.success && typeof definition.success === 'object' ? definition.success : {}),
  }
  let fields = Array.isArray(definition.fields) ? definition.fields : []
  const hasGame = fields.some((field) => GAME_TYPES.has(field?.type))
  const gameHint = definition.behavior?.gamification
  if (!hasGame && typeof gameHint === 'string' && GAME_TYPES.has(gameHint)) {
    fields = [
      ...fields,
      {
        id: `f_${gameHint}`,
        type: gameHint,
        label:
          gameHint === 'wheel'
            ? 'Wheel of fortune'
            : gameHint[0].toUpperCase() + gameHint.slice(1).replace('_', ' '),
        required: false,
        props: { prizes: ['5% off', '10% off', '20% off', '30% off'] },
      },
    ]
  }

  return {
    id: resource.id,
    name: resource.name || 'Untitled form',
    type: ['embedded', 'landing_page', 'flyout', 'fullscreen'].includes(resource.type)
      ? resource.type
      : 'popup',
    status: resource.status === 'enabled' ? 'enabled' : 'draft',
    submissions: resource.submissions_count ?? 0,
    publicToken: resource.public_token || null,
    embedUrl: resource.embed_url || null,
    headline: definition.headline || '',
    subheadline: definition.subheadline || '',
    buttonLabel: definition.button_label || 'Subscribe',
    layout: definition.layout === 'split' || hasGame ? 'split' : 'stack',
    tags: Array.isArray(definition.tags) ? definition.tags : ['form_subscriber'],
    fields,
    theme: {
      accent: definition.theme?.accent || '#2878FF',
      background: definition.theme?.background || '#FFFFFF',
      text: definition.theme?.text || '#10131C',
    },
    behavior,
    success: {
      headline: success.headline || '',
      subheadline: success.subheadline || '',
      buttonLabel: success.button_label || 'Continue shopping',
    },
  }
}

/**
 * Map editor state → API definition payload.
 * @param {object} editor
 */
export function toFormDefinitionPayload(editor) {
  const hasGame = (editor.fields || []).some((field) => GAME_TYPES.has(field?.type))
  return {
    headline: editor.headline || '',
    subheadline: editor.subheadline || '',
    button_label: editor.buttonLabel || 'Subscribe',
    layout: editor.layout === 'split' || hasGame ? 'split' : 'stack',
    tags: Array.isArray(editor.tags) ? editor.tags : [],
    fields: Array.isArray(editor.fields) ? editor.fields : [],
    theme: {
      accent: editor.theme?.accent || '#2878FF',
      background: editor.theme?.background || '#FFFFFF',
      text: editor.theme?.text || '#10131C',
    },
    behavior: {
      display: editor.behavior?.display || 'After spending 5 sec on the page',
      devices: editor.behavior?.devices || 'Show on all devices',
      frequency: editor.behavior?.frequency || 'Show after 1 day',
      scheduling: editor.behavior?.scheduling || 'Always available',
      targeting: editor.behavior?.targeting || 'All visitors',
      redirect: editor.behavior?.redirect || 'Stay on page',
      ...(editor.behavior?.gamification ? { gamification: editor.behavior.gamification } : {}),
      ...(editor.behavior?.teaser ? { teaser: editor.behavior.teaser } : {}),
      ...(editor.behavior?.countdown ? { countdown: editor.behavior.countdown } : {}),
      ...(editor.behavior?.steps ? { steps: editor.behavior.steps } : {}),
    },
    success: {
      headline: editor.success?.headline || "YOU'RE IN!",
      subheadline: editor.success?.subheadline || 'Check your inbox for your offer.',
      button_label: editor.success?.buttonLabel || 'Continue shopping',
    },
  }
}

/**
 * GET /api/v1/stores/{store}/forms
 */
export async function listStoreForms(storeId, params = {}, deps = {}) {
  const query = buildAudienceQuery({
    q: params.q,
    type: params.type,
    status: params.status,
    cursor: params.cursor,
    limit: params.limit ?? 25,
  })
  const path = `${storeAudiencePath(storeId, 'forms')}${query}`
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load forms.')
  return readAudienceCursorPage(response)
}

/**
 * GET /api/v1/stores/{store}/forms/summary
 */
export async function getStoreFormsSummary(storeId, deps = {}) {
  const path = storeAudiencePath(storeId, 'forms/summary')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load form summary.')
  const json = await readAudienceJson(response)
  return json?.data || { total: 0, enabled: 0, draft: 0 }
}

/**
 * POST /api/v1/stores/{store}/forms
 */
export async function createStoreForm(storeId, payload, deps = {}) {
  const body = {
    name: payload.name,
    type: payload.type || 'popup',
  }
  if (payload.status) body.status = payload.status
  if (payload.definition) body.definition = payload.definition

  const path = storeAudiencePath(storeId, 'forms')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to create the form.')
  return readAudienceResource(response, 'form')
}

/**
 * GET /api/v1/forms/{id}
 */
export async function getForm(formId, deps = {}) {
  const id = requireFormId(formId)
  const path = audienceResourcePath('forms', id)
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the form.')
  return readAudienceResource(response, 'form')
}

/**
 * PUT /api/v1/forms/{id}
 */
export async function updateForm(formId, payload, deps = {}) {
  const id = requireFormId(formId)
  const body = {}
  if (typeof payload.name === 'string') body.name = payload.name
  if (typeof payload.type === 'string') body.type = payload.type
  if (typeof payload.status === 'string') body.status = payload.status
  if (Object.prototype.hasOwnProperty.call(payload, 'definition')) {
    body.definition = payload.definition
  }

  const path = audienceResourcePath('forms', id)
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to update the form.')
  return readAudienceResource(response, 'form')
}

/**
 * DELETE /api/v1/forms/{id}
 */
export async function deleteForm(formId, deps = {}) {
  const id = requireFormId(formId)
  const path = audienceResourcePath('forms', id)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to delete the form.')
}

export { GAME_TYPES }
