import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createEmailBlock,
  createStoreEmailTemplate,
  emptyEmailDocument,
  listStoreEmailTemplates,
  previewEmailDocument,
  resolveAssetPlaceholders,
} from './emailTemplatesApi.js'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createFetchMock(handlers) {
  return async (url, options = {}) => {
    if (String(url).includes('/sanctum/csrf-cookie')) {
      return new Response(null, { status: 204 })
    }
    const method = options.method || 'GET'
    const key = `${method} ${url}`
    const handler = handlers[key]
    if (!handler) throw new Error(`Unexpected fetch: ${key}`)
    return typeof handler === 'function' ? handler(url, options) : handler
  }
}

describe('emailTemplatesApi', () => {
  it('builds empty documents and blocks', () => {
    const doc = emptyEmailDocument()
    assert.equal(doc.version, 1)
    assert.ok(Array.isArray(doc.blocks))
    assert.equal(createEmailBlock('button').props.label, 'Shop now')
  })

  it('lists and creates templates', async () => {
    const document = emptyEmailDocument()
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/email-templates?status=published&limit=25': jsonResponse(200, {
        data: [{ id: '01TPL', name: 'Welcome', status: 'published' }],
        meta: { next_cursor: null },
        links: {},
      }),
      'POST /api/v1/stores/01STORE/email-templates': (_url, options) => {
        const body = JSON.parse(options.body)
        assert.equal(body.name, 'Welcome')
        assert.equal(body.document.version, 1)
        return jsonResponse(201, {
          data: { id: '01TPL', name: 'Welcome', document, html: '<p>Hi</p>' },
        })
      },
    })

    const list = await listStoreEmailTemplates(
      '01STORE',
      { status: 'published' },
      { fetchFn },
    )
    assert.equal(list.data[0].id, '01TPL')

    const created = await createStoreEmailTemplate(
      '01STORE',
      { name: 'Welcome', document },
      { fetchFn },
    )
    assert.equal(created.id, '01TPL')
  })

  it('previews documents and resolves asset placeholders', async () => {
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/email-templates/preview': jsonResponse(200, {
        html: '<img src="inboxly-asset://01ASSET">',
      }),
    })

    const preview = await previewEmailDocument(
      '01STORE',
      emptyEmailDocument(),
      { fetchFn },
    )
    assert.match(preview.html, /inboxly-asset/)

    const resolved = await resolveAssetPlaceholders(preview.html, async (id) =>
      id === '01ASSET' ? 'blob:mock' : null,
    )
    assert.equal(resolved, '<img src="blob:mock">')
  })
})
