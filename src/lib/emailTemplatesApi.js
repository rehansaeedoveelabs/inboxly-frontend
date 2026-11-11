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
 * Email templates — Laravel EmailTemplateController.
 *
 * List/create/preview: /api/v1/stores/{store}/email-templates[…]
 * Show/update/delete/duplicate: /api/v1/email-templates/{id}[…]
 *
 * Source of truth is block-document JSON; `html` is a rendered snapshot.
 */

export const EMAIL_BLOCK_TYPES = [
  'header',
  'text',
  'image',
  'button',
  'divider',
  'spacer',
  'footer',
]

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
 * @returns {{ version: number, settings: { width: number, background: string }, blocks: Array<object> }}
 */
export function emptyEmailDocument() {
  return {
    version: 1,
    settings: { width: 600, background: '#ffffff' },
    blocks: [
      {
        id: `blk_${Date.now()}`,
        type: 'header',
        props: { html: '<p><strong>Your headline</strong></p>', align: 'center' },
      },
      {
        id: `blk_${Date.now() + 1}`,
        type: 'text',
        props: { html: '<p>Write your message here.</p>', align: 'left' },
      },
    ],
  }
}

/**
 * @param {string} type
 * @returns {{ id: string, type: string, props: Record<string, unknown> }}
 */
export function createEmailBlock(type) {
  const id = `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  switch (type) {
    case 'header':
      return { id, type, props: { html: '<p><strong>Headline</strong></p>', align: 'center' } }
    case 'footer':
      return {
        id,
        type,
        props: { html: '<p>You received this email because you subscribed.</p>', align: 'center' },
      }
    case 'text':
      return { id, type, props: { html: '<p>New text block</p>', align: 'left' } }
    case 'image':
      return { id, type, props: { asset_id: null, alt: '', href: null } }
    case 'button':
      return { id, type, props: { label: 'Shop now', href: 'https://example.com' } }
    case 'divider':
      return { id, type, props: {} }
    case 'spacer':
      return { id, type, props: { height: 24 } }
    default:
      throw new ApiError(`Unsupported block type: ${type}`, { status: 422 })
  }
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
export async function listStoreEmailTemplates(storeId, params = {}, deps = {}) {
  const query = buildAudienceQuery({
    q: params.q,
    category: params.category,
    status: params.status,
    cursor: params.cursor,
    limit: params.limit ?? 25,
  })
  const path = `${storeAudiencePath(storeId, 'email-templates')}${query}`
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load email templates.')
  return readAudienceCursorPage(response)
}

/**
 * @param {string} storeId
 * @param {{
 *   name: string,
 *   category?: string | null,
 *   status?: string,
 *   document: object,
 * }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function createStoreEmailTemplate(storeId, payload, deps = {}) {
  const body = {
    name: payload.name,
    document: payload.document,
  }
  if (payload.category != null) body.category = payload.category
  if (payload.status) body.status = payload.status

  const path = storeAudiencePath(storeId, 'email-templates')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to create the email template.')
  return readAudienceResource(response, 'email template')
}

/**
 * @param {string} templateId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getEmailTemplate(templateId, deps = {}) {
  const id = requireTemplateId(templateId)
  const path = audienceResourcePath('email-templates', id)
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the email template.')
  return readAudienceResource(response, 'email template')
}

/**
 * @param {string} templateId
 * @param {{
 *   name?: string,
 *   category?: string | null,
 *   status?: string,
 *   document?: object,
 * }} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function updateEmailTemplate(templateId, payload, deps = {}) {
  const id = requireTemplateId(templateId)
  const body = {}
  if (typeof payload.name === 'string') body.name = payload.name
  if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
    body.category = payload.category
  }
  if (typeof payload.status === 'string') body.status = payload.status
  if (Object.prototype.hasOwnProperty.call(payload, 'document')) {
    body.document = payload.document
  }

  const path = audienceResourcePath('email-templates', id)
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to update the email template.')
  return readAudienceResource(response, 'email template')
}

/**
 * @param {string} templateId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function deleteEmailTemplate(templateId, deps = {}) {
  const id = requireTemplateId(templateId)
  const path = audienceResourcePath('email-templates', id)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to delete the email template.')
}

/**
 * @param {string} templateId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function duplicateEmailTemplate(templateId, deps = {}) {
  const id = requireTemplateId(templateId)
  const path = audienceResourcePath('email-templates', id, 'duplicate')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to duplicate the email template.')
  return readAudienceResource(response, 'email template')
}

/**
 * POST /api/v1/stores/{store}/email-templates/preview → { html }
 *
 * @param {string} storeId
 * @param {object} document
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 * @returns {Promise<{ html: string }>}
 */
export async function previewEmailDocument(storeId, document, deps = {}) {
  const path = storeAudiencePath(storeId, 'email-templates/preview')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document }),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to preview the template.')
  const payload = await readAudienceJson(response)
  if (typeof payload.html !== 'string') {
    throw new ApiError('Invalid template preview response.', {
      status: response.status,
      body: payload,
    })
  }
  return { html: payload.html }
}

/**
 * Rewrite inboxly-asset://{id} placeholders using authenticated blob URLs.
 *
 * @param {string} html
 * @param {(assetId: string) => Promise<string | null>} resolveUrl
 */
export async function resolveAssetPlaceholders(html, resolveUrl) {
  if (typeof html !== 'string' || html === '') return html
  const ids = [...html.matchAll(/inboxly-asset:\/\/([A-Za-z0-9]+)/g)].map((m) => m[1])
  const unique = [...new Set(ids)]
  let next = html
  for (const id of unique) {
    const url = await resolveUrl(id)
    if (url) {
      next = next.split(`inboxly-asset://${id}`).join(url)
    }
  }
  return next
}
