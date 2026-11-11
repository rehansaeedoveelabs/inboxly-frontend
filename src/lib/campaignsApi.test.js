import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  createStoreCampaign,
  deleteCampaign,
  duplicateCampaign,
  formatCampaignAudience,
  getCampaign,
  getCampaignsSummary,
  listStoreCampaigns,
  previewCampaignAudience,
  scheduleCampaign,
  unscheduleCampaign,
  updateCampaign,
} from './campaignsApi.js'

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

const sampleCampaign = {
  id: '01CAMP',
  store_id: '01STORE',
  name: 'Spring launch',
  channel: 'email',
  status: 'draft',
  subject: 'Hello',
  preview_text: 'Preview',
  body: 'Body',
  audience_type: 'all_eligible',
  segment_id: null,
  scheduled_at: null,
  audience_count: null,
}

describe('campaignsApi', () => {
  it('lists campaigns with filters and cursor pagination', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/campaigns?q=Spring&status=draft&channel=email&limit=25':
        jsonResponse(200, {
          data: [sampleCampaign],
          meta: { next_cursor: 'CURSOR1' },
          links: {},
        }),
      'GET /api/v1/stores/01STORE/campaigns?cursor=CURSOR1&limit=25': jsonResponse(200, {
        data: [{ ...sampleCampaign, id: '01CAMP2', name: 'Next' }],
        meta: { next_cursor: null },
        links: {},
      }),
    })

    const first = await listStoreCampaigns(
      '01STORE',
      { q: 'Spring', status: 'draft', channel: 'email', limit: 25 },
      { fetchFn },
    )
    assert.equal(first.data.length, 1)
    assert.equal(first.nextCursor, 'CURSOR1')

    const second = await listStoreCampaigns(
      '01STORE',
      { cursor: 'CURSOR1', limit: 25 },
      { fetchFn },
    )
    assert.equal(second.data[0].id, '01CAMP2')
    assert.equal(second.nextCursor, null)
  })

  it('loads summary totals', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/campaigns/summary': jsonResponse(200, {
        total: 5,
        draft: 3,
        scheduled: 2,
      }),
    })

    const summary = await getCampaignsSummary('01STORE', { fetchFn })
    assert.deepEqual(summary, { total: 5, draft: 3, scheduled: 2 })
  })

  it('creates and updates campaigns', async () => {
    let createBody = null
    let updateBody = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/campaigns': async (_url, options) => {
        createBody = JSON.parse(options.body)
        return jsonResponse(201, { data: { ...sampleCampaign, ...createBody, id: '01NEW' } })
      },
      'PUT /api/v1/campaigns/01CAMP': async (_url, options) => {
        updateBody = JSON.parse(options.body)
        return jsonResponse(200, { data: { ...sampleCampaign, ...updateBody } })
      },
    })

    const created = await createStoreCampaign(
      '01STORE',
      {
        name: '  Launch  ',
        channel: 'email',
        subject: 'Hi',
        body: 'Copy',
        audience_type: 'segment',
        segment_id: '01SEG',
      },
      { fetchFn },
    )
    assert.equal(created.id, '01NEW')
    assert.deepEqual(createBody, {
      name: 'Launch',
      channel: 'email',
      subject: 'Hi',
      body: 'Copy',
      audience_type: 'segment',
      segment_id: '01SEG',
    })

    const updated = await updateCampaign(
      '01CAMP',
      { name: 'Renamed', body: 'Updated' },
      { fetchFn },
    )
    assert.equal(updated.name, 'Renamed')
    assert.deepEqual(updateBody, { name: 'Renamed', body: 'Updated' })
  })

  it('loads, schedules, unschedules, duplicates, and deletes', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/campaigns/01CAMP': jsonResponse(200, { data: sampleCampaign }),
      'POST /api/v1/campaigns/01CAMP/schedule': async (_url, options) => {
        const body = JSON.parse(options.body)
        assert.equal(body.scheduled_at, '2026-12-01T10:00:00.000Z')
        return jsonResponse(200, {
          data: {
            ...sampleCampaign,
            status: 'scheduled',
            scheduled_at: body.scheduled_at,
            audience_count: 4,
          },
        })
      },
      'POST /api/v1/campaigns/01CAMP/unschedule': jsonResponse(200, {
        data: { ...sampleCampaign, status: 'draft', scheduled_at: null, audience_count: null },
      }),
      'POST /api/v1/campaigns/01CAMP/duplicate': jsonResponse(201, {
        data: { ...sampleCampaign, id: '01COPY', name: 'Copy of Spring launch' },
      }),
      'DELETE /api/v1/campaigns/01CAMP': new Response(null, { status: 204 }),
    })

    const loaded = await getCampaign('01CAMP', { fetchFn })
    assert.equal(loaded.id, '01CAMP')

    const scheduled = await scheduleCampaign(
      '01CAMP',
      { scheduled_at: '2026-12-01T10:00:00.000Z' },
      { fetchFn },
    )
    assert.equal(scheduled.status, 'scheduled')
    assert.equal(scheduled.audience_count, 4)

    const draft = await unscheduleCampaign('01CAMP', { fetchFn })
    assert.equal(draft.status, 'draft')
    assert.equal(draft.audience_count, null)

    const copy = await duplicateCampaign('01CAMP', { fetchFn })
    assert.equal(copy.id, '01COPY')

    await deleteCampaign('01CAMP', { fetchFn })
  })

  it('previews eligible audience count', async () => {
    let body = null
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/campaigns/audience-preview': async (_url, options) => {
        body = JSON.parse(options.body)
        return jsonResponse(200, { count: 12 })
      },
    })

    const result = await previewCampaignAudience(
      '01STORE',
      { channel: 'email', audience_type: 'segment', segment_id: '01SEG' },
      { fetchFn },
    )
    assert.equal(result.count, 12)
    assert.deepEqual(body, {
      channel: 'email',
      audience_type: 'segment',
      segment_id: '01SEG',
    })
  })

  it('surfaces 409 when editing a scheduled campaign', async () => {
    const fetchFn = createFetchMock({
      'PUT /api/v1/campaigns/01CAMP': jsonResponse(409, {
        message: 'Scheduled campaigns cannot be edited. Unschedule first.',
      }),
      'DELETE /api/v1/campaigns/01CAMP': jsonResponse(409, {
        message: 'Scheduled campaigns cannot be deleted. Unschedule first.',
      }),
    })

    await assert.rejects(
      () => updateCampaign('01CAMP', { name: 'Nope' }, { fetchFn }),
      (error) => error instanceof ApiError && error.status === 409,
    )
    await assert.rejects(
      () => deleteCampaign('01CAMP', { fetchFn }),
      (error) => error instanceof ApiError && error.status === 409,
    )
  })

  it('rejects missing ids before network and formats audience labels', async () => {
    let called = false
    const fetchFn = async () => {
      called = true
      return jsonResponse(200, { data: sampleCampaign })
    }

    await assert.rejects(
      () => getCampaign('', { fetchFn }),
      (error) => error instanceof ApiError && error.status === 422,
    )
    await assert.rejects(
      () => updateCampaign('  ', { name: 'x' }, { fetchFn }),
      (error) => error instanceof ApiError,
    )
    await assert.rejects(
      () => listStoreCampaigns('', {}, { fetchFn }),
      (error) => error instanceof ApiError,
    )
    assert.equal(called, false)

    assert.equal(
      formatCampaignAudience({ audience_type: 'all_eligible' }),
      'All eligible contacts',
    )
    assert.equal(
      formatCampaignAudience({ audience_type: 'segment', segment_id: '01SEG' }, { '01SEG': 'VIP' }),
      'VIP',
    )
    assert.equal(formatCampaignAudience({ audience_type: 'segment' }), 'Segment')
  })

  it('propagates API errors from summary and preview', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/campaigns/summary': jsonResponse(500, {
        message: 'Server error',
      }),
      'POST /api/v1/stores/01STORE/campaigns/audience-preview': jsonResponse(422, {
        message: 'The segment id field is required.',
        errors: { segment_id: ['The segment id field is required.'] },
      }),
    })

    await assert.rejects(
      () => getCampaignsSummary('01STORE', { fetchFn }),
      (error) => error instanceof ApiError && error.status === 500,
    )
    await assert.rejects(
      () =>
        previewCampaignAudience(
          '01STORE',
          { channel: 'email', audience_type: 'segment' },
          { fetchFn },
        ),
      (error) => error instanceof ApiError && error.status === 422,
    )
  })
})
