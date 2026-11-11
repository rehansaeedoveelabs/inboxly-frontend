import { ApiError, readJsonSafe } from './api.js'
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
 * Contacts API — Laravel ContactController + consent/tag mutation contracts.
 */

/**
 * 409 from create when email/phone matches a soft-deleted contact.
 */
export class ContactDeletedConflictError extends ApiError {
  /**
   * @param {string} message
   * @param {Record<string, unknown>} contact
   * @param {unknown} [body]
   */
  constructor(message, contact, body) {
    super(message, { status: 409, body })
    this.name = 'ContactDeletedConflictError'
    this.contact = contact
  }
}

/**
 * @param {string | null | undefined} contactId
 * @returns {string}
 */
function requireContactId(contactId) {
  if (typeof contactId !== 'string' || contactId.trim() === '') {
    throw new ApiError('A contact id is required.', { status: 422 })
  }
  return contactId.trim()
}

/**
 * Cursor-paginated contact list for a store.
 *
 * @param {string} storeId
 * @param {{
 *   cursor?: string | null,
 *   limit?: number,
 *   q?: string | null,
 *   tag?: string | null,
 *   consent_email?: string | null,
 * }} [filters]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function listStoreContacts(storeId, filters = {}, deps = {}) {
  const query = buildAudienceQuery({
    cursor: filters.cursor,
    limit: filters.limit,
    q: filters.q,
    tag: filters.tag,
    consent_email: filters.consent_email,
  })
  const path = `${storeAudiencePath(storeId, 'contacts')}${query}`
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load contacts.')
  return readAudienceCursorPage(response)
}

/**
 * @param {string} contactId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function getContact(contactId, deps = {}) {
  const id = requireContactId(contactId)
  const path = audienceResourcePath('contacts', id)
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load the contact.')
  return readAudienceResource(response, 'contact')
}

/**
 * POST /api/v1/stores/{store}/contacts → 201 { data: ContactResource }
 *
 * @param {string} storeId
 * @param {Record<string, unknown>} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function createStoreContact(storeId, payload, deps = {}) {
  const path = storeAudiencePath(storeId, 'contacts')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    deps,
  )

  if (response.status === 409) {
    const body = await readJsonSafe(response)
    if (body?.error === 'contact_deleted' && body?.contact && typeof body.contact === 'object') {
      throw new ContactDeletedConflictError(
        typeof body.message === 'string' && body.message
          ? body.message
          : 'A deleted contact with this email or phone already exists. Restore it to continue.',
        body.contact,
        body,
      )
    }
  }

  await assertAudienceOk(response, 'Unable to create the contact.')
  return readAudienceResource(response, 'contact')
}

/**
 * POST /api/v1/contacts/{contact}/restore → 200 { data: ContactResource }
 *
 * @param {string} contactId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function restoreContact(contactId, deps = {}) {
  const id = requireContactId(contactId)
  const path = audienceResourcePath('contacts', id, 'restore')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to restore the contact.')
  return readAudienceResource(response, 'contact')
}

/**
 * POST /api/v1/contacts/{contact}/consent-review → 200 { data: ContactResource }
 * Clears the post-restore review gate without changing consent statuses.
 *
 * @param {string} contactId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function reviewContactConsents(contactId, deps = {}) {
  const id = requireContactId(contactId)
  const path = audienceResourcePath('contacts', id, 'consent-review')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to complete consent review.')
  return readAudienceResource(response, 'contact')
}

/**
 * PUT /api/v1/contacts/{contact}
 *
 * @param {string} contactId
 * @param {Record<string, unknown>} payload
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function updateContact(contactId, payload, deps = {}) {
  const id = requireContactId(contactId)
  const path = audienceResourcePath('contacts', id)
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to update the contact.')
  return readAudienceResource(response, 'contact')
}

/**
 * DELETE /api/v1/contacts/{contact} → 204
 *
 * @param {string} contactId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function deleteContact(contactId, deps = {}) {
  const id = requireContactId(contactId)
  const path = audienceResourcePath('contacts', id)
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to delete the contact.')
}

/**
 * PUT /api/v1/contacts/{contact}/consents
 * Body: { consents: [{ channel, status, source? }] }
 *
 * @param {string} contactId
 * @param {Array<{ channel: string, status: string, source?: string | null }>} consents
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function updateContactConsents(contactId, consents, deps = {}) {
  const id = requireContactId(contactId)
  const path = audienceResourcePath('contacts', id, 'consents')
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consents }),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to update consents.')
  return readAudienceResource(response, 'contact')
}

/**
 * POST /api/v1/contacts/{contact}/tags  Body: { tag_ids: string[] }
 *
 * @param {string} contactId
 * @param {string[]} tagIds
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function attachContactTags(contactId, tagIds, deps = {}) {
  const id = requireContactId(contactId)
  const path = audienceResourcePath('contacts', id, 'tags')
  const response = await audienceFetch(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag_ids: tagIds }),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to attach tags.')
  return readAudienceResource(response, 'contact')
}

/**
 * DELETE /api/v1/contacts/{contact}/tags/{tag}
 *
 * @param {string} contactId
 * @param {string} tagId
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function detachContactTag(contactId, tagId, deps = {}) {
  const id = requireContactId(contactId)
  if (typeof tagId !== 'string' || tagId.trim() === '') {
    throw new ApiError('A tag id is required.', { status: 422 })
  }
  const path = audienceResourcePath('contacts', id, 'tags', tagId.trim())
  const response = await audienceFetch(path, { method: 'DELETE' }, deps)
  await assertAudienceOk(response, 'Unable to remove the tag.')
  return readAudienceResource(response, 'contact')
}
