import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createStoreSmsTemplate,
  listStoreSmsTemplates,
  updateSmsTemplate,
} from './smsTemplatesApi.js'

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

describe('smsTemplatesApi', () => {
  it('lists and creates templates', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/sms-templates?limit=25': jsonResponse(200, {
        data: [{ id: '01SMS', name: 'Welcome', body: 'Hi' }],
        meta: { next_cursor: null },
        links: {},
      }),
      'POST /api/v1/stores/01STORE/sms-templates': (_url, options) => {
        const body = JSON.parse(options.body)
        assert.equal(body.name, 'Welcome')
        assert.equal(body.body, 'Hi {{first_name}}')
        return jsonResponse(201, {
          data: { id: '01SMS', name: 'Welcome', body: body.body, category: 'welcome' },
        })
      },
    })

    const list = await listStoreSmsTemplates('01STORE', {}, { fetchFn })
    assert.equal(list.data[0].id, '01SMS')

    const created = await createStoreSmsTemplate(
      '01STORE',
      { name: 'Welcome', body: 'Hi {{first_name}}', category: 'welcome' },
      { fetchFn },
    )
    assert.equal(created.id, '01SMS')
  })

  it('updates a template', async () => {
    const fetchFn = createFetchMock({
      'PUT /api/v1/sms-templates/01SMS': (_url, options) => {
        const body = JSON.parse(options.body)
        assert.equal(body.body, 'Updated')
        return jsonResponse(200, {
          data: { id: '01SMS', name: 'Welcome', body: 'Updated' },
        })
      },
    })

    const updated = await updateSmsTemplate('01SMS', { body: 'Updated' }, { fetchFn })
    assert.equal(updated.body, 'Updated')
  })
})
