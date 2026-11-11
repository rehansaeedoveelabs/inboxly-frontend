import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  ContactDeletedConflictError,
  attachContactTags,
  createStoreContact,
  deleteContact,
  detachContactTag,
  getContact,
  listStoreContacts,
  restoreContact,
  reviewContactConsents,
  updateContact,
  updateContactConsents,
} from './contactsApi.js'

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
  })
}

function createFetchMock(handlers) {
  return async (url, options = {}) => {
    if (String(url).includes('/sanctum/csrf-cookie')) {
      return new Response(null, { status: 204 })
    }
    const method = options.method || 'GET'
    const handler = handlers[`${method} ${url}`]
    if (!handler) throw new Error(`Unexpected fetch: ${method} ${url}`)
    return typeof handler === 'function' ? handler(url, options) : handler
  }
}

const sampleContact = {
  id: '01CONTACT',
  store_id: '01STORE',
  email: 'jane@example.com',
  phone: '+15550109999',
  first_name: 'Jane',
  last_name: 'Doe',
  tags: [{ id: '01TAG', name: 'VIP', slug: 'vip' }],
  consents: {
    email: { status: 'nonsubscribed', source: null, consented_at: null },
    sms: { status: 'nonsubscribed', source: null, consented_at: null },
    push: { status: 'nonsubscribed', source: null, consented_at: null },
  },
}

describe('contactsApi', () => {
  it('lists contacts with cursor page envelope and filter query params', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/contacts?limit=25&q=jane&consent_email=subscribed': jsonResponse(
        200,
        {
          data: [sampleContact],
          links: { next: null, prev: null },
          meta: { per_page: 25, next_cursor: null, prev_cursor: null },
        },
      ),
    })

    const page = await listStoreContacts(
      '01STORE',
      { q: 'jane', consent_email: 'subscribed', limit: 25 },
      { fetchFn },
    )
    assert.equal(page.data[0].first_name, 'Jane')
    assert.equal(page.nextCursor, null)
  })

  it('rejects missing store id before any network request', async () => {
    let called = false
    await assert.rejects(
      () =>
        listStoreContacts(null, {}, {
          fetchFn: async () => {
            called = true
            return jsonResponse(200, { data: [] })
          },
        }),
      (error) => error instanceof ApiError && error.status === 422,
    )
    assert.equal(called, false)
  })

  it('creates, updates, and deletes contacts', async () => {
    let createBody = null
    let updateBody = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/contacts': async (_url, options) => {
        createBody = JSON.parse(options.body)
        return jsonResponse(201, { data: { ...sampleContact, ...createBody, id: '01NEW' } })
      },
      'PUT /api/v1/contacts/01CONTACT': async (_url, options) => {
        updateBody = JSON.parse(options.body)
        return jsonResponse(200, { data: { ...sampleContact, ...updateBody } })
      },
      'DELETE /api/v1/contacts/01CONTACT': new Response(null, { status: 204 }),
    })

    const created = await createStoreContact(
      '01STORE',
      { email: 'a@b.co', first_name: 'A' },
      { fetchFn },
    )
    assert.equal(created.id, '01NEW')
    assert.equal(createBody.email, 'a@b.co')

    const updated = await updateContact('01CONTACT', { first_name: 'Janet' }, { fetchFn })
    assert.equal(updated.first_name, 'Janet')
    assert.deepEqual(updateBody, { first_name: 'Janet' })

    await deleteContact('01CONTACT', { fetchFn })
  })

  it('updates consents and attaches/detaches tags', async () => {
    let consentBody = null
    let attachBody = null
    const fetchFn = createFetchMock({
      'PUT /api/v1/contacts/01CONTACT/consents': async (_url, options) => {
        consentBody = JSON.parse(options.body)
        return jsonResponse(200, {
          data: {
            ...sampleContact,
            consents: {
              ...sampleContact.consents,
              email: { status: 'subscribed', source: 'manual', consented_at: '2026-01-01T00:00:00Z' },
            },
          },
        })
      },
      'POST /api/v1/contacts/01CONTACT/tags': async (_url, options) => {
        attachBody = JSON.parse(options.body)
        return jsonResponse(200, { data: sampleContact })
      },
      'DELETE /api/v1/contacts/01CONTACT/tags/01TAG': jsonResponse(200, {
        data: { ...sampleContact, tags: [] },
      }),
      'GET /api/v1/contacts/01CONTACT': jsonResponse(200, { data: sampleContact }),
    })

    const consented = await updateContactConsents(
      '01CONTACT',
      [{ channel: 'email', status: 'subscribed', source: 'manual' }],
      { fetchFn },
    )
    assert.equal(consented.consents.email.status, 'subscribed')
    assert.deepEqual(consentBody, {
      consents: [{ channel: 'email', status: 'subscribed', source: 'manual' }],
    })

    await attachContactTags('01CONTACT', ['01TAG'], { fetchFn })
    assert.deepEqual(attachBody, { tag_ids: ['01TAG'] })

    const detached = await detachContactTag('01CONTACT', '01TAG', { fetchFn })
    assert.deepEqual(detached.tags, [])

    const loaded = await getContact('01CONTACT', { fetchFn })
    assert.equal(loaded.id, '01CONTACT')
  })

  it('surfaces validation failures on create', async () => {
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/contacts': jsonResponse(422, {
        message: 'The given data was invalid.',
        errors: { email: ['The email has already been taken.'] },
      }),
    })

    await assert.rejects(
      () => createStoreContact('01STORE', { email: 'dup@x.com' }, { fetchFn }),
      (error) =>
        error instanceof ApiError &&
        error.status === 422 &&
        error.errors?.email?.[0] === 'The email has already been taken.',
    )
  })

  it('throws ContactDeletedConflictError on 409 contact_deleted create', async () => {
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/contacts': jsonResponse(409, {
        error: 'contact_deleted',
        message: 'A deleted contact with this email or phone already exists. Restore it to continue.',
        contact: {
          ...sampleContact,
          consent_review_required: false,
          consents: {
            email: { status: 'subscribed', source: null, consented_at: null },
            sms: { status: 'nonsubscribed', source: null, consented_at: null },
            push: { status: 'nonsubscribed', source: null, consented_at: null },
          },
        },
      }),
    })

    await assert.rejects(
      () => createStoreContact('01STORE', { email: 'jane@example.com' }, { fetchFn }),
      (error) =>
        error instanceof ContactDeletedConflictError &&
        error.status === 409 &&
        error.contact?.id === '01CONTACT' &&
        error.contact?.consents?.email?.status === 'subscribed',
    )
  })

  it('restores a contact and reviews consents', async () => {
    let restoreCalled = false
    let reviewCalled = false
    const fetchFn = createFetchMock({
      'POST /api/v1/contacts/01CONTACT/restore': () => {
        restoreCalled = true
        return jsonResponse(200, {
          data: {
            ...sampleContact,
            consent_review_required: true,
            consent_review_required_at: '2026-11-11T12:00:00Z',
            marketing_eligible: { email: false, sms: false, push: false },
          },
        })
      },
      'POST /api/v1/contacts/01CONTACT/consent-review': () => {
        reviewCalled = true
        return jsonResponse(200, {
          data: {
            ...sampleContact,
            consent_review_required: false,
            consent_review_required_at: null,
            marketing_eligible: { email: false, sms: false, push: false },
          },
        })
      },
    })

    const restored = await restoreContact('01CONTACT', { fetchFn })
    assert.equal(restoreCalled, true)
    assert.equal(restored.consent_review_required, true)

    const reviewed = await reviewContactConsents('01CONTACT', { fetchFn })
    assert.equal(reviewCalled, true)
    assert.equal(reviewed.consent_review_required, false)
  })

  it('creates with restore true after conflict confirmation', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/contacts': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(201, {
          data: {
            ...sampleContact,
            first_name: body.first_name,
            consent_review_required: true,
          },
        })
      },
    })

    const created = await createStoreContact(
      '01STORE',
      { email: 'jane@example.com', first_name: 'Restored', restore: true },
      { fetchFn },
    )
    assert.equal(body.restore, true)
    assert.equal(created.consent_review_required, true)
    assert.equal(created.first_name, 'Restored')
  })
})
