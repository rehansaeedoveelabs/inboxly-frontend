import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError } from './api.js'
import {
  appendUtmParams,
  createCampaignMetaPublications,
  getCampaignMetaEligiblePages,
  listCampaignMetaPublications,
  publicationStatusLabel,
  reconcileCampaignMetaPublication,
  retryCampaignMetaPublication,
  updateCampaignSocialContent,
} from './campaignMetaApi.js'

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
    const handler = handlers[`${method} ${url}`]
    if (!handler) throw new Error(`Unexpected fetch: ${method} ${url}`)
    return typeof handler === 'function' ? handler(url, options) : handler
  }
}

describe('campaignMetaApi', () => {
  it('loads eligible pages and publication history', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/campaigns/01CAMP/meta/eligible-pages': jsonResponse(200, {
        data: {
          connection_usable: true,
          needs_reauth: false,
          missing_scopes: [],
          pages: [
            {
              id: '01PAGE',
              meta_page_id: 'pg-1',
              name: 'Demo',
              can_publish: true,
              is_default: true,
            },
          ],
        },
      }),
      'GET /api/v1/campaigns/01CAMP/meta/publications': jsonResponse(200, {
        data: [
          {
            id: '01PUB',
            status: 'published',
            simulated: true,
            provider_post_id: 'simulated_post_abc',
            page: { id: '01PAGE', name: 'Demo' },
          },
        ],
      }),
    })

    const eligible = await getCampaignMetaEligiblePages('01CAMP', { fetchFn })
    assert.equal(eligible.connection_usable, true)
    assert.equal(eligible.pages[0].can_publish, true)

    const pubs = await listCampaignMetaPublications('01CAMP', { fetchFn })
    assert.equal(pubs.length, 1)
    assert.equal(pubs[0].simulated, true)
    assert.match(pubs[0].provider_post_id, /^simulated_post_/)
  })

  it('saves social content and creates publications', async () => {
    const fetchFn = createFetchMock({
      'PUT /api/v1/campaigns/01CAMP/meta/social-content': async (_url, options) => {
        const body = JSON.parse(options.body)
        assert.equal(body.message, 'Hello FB')
        assert.equal(body.link, 'https://example.com/x')
        return jsonResponse(200, {
          data: {
            id: '01CAMP',
            meta_message: 'Hello FB',
            meta_link: 'https://example.com/x',
          },
        })
      },
      'POST /api/v1/campaigns/01CAMP/meta/publications': async (_url, options) => {
        const body = JSON.parse(options.body)
        assert.deepEqual(body.meta_page_ids, ['01PAGE'])
        assert.equal(body.confirm_republish, true)
        return jsonResponse(202, {
          data: [
            {
              id: '01PUB',
              status: 'queued',
              simulated: true,
              meta_page_id: '01PAGE',
            },
          ],
        })
      },
    })

    const campaign = await updateCampaignSocialContent(
      '01CAMP',
      { message: 'Hello FB', link: 'https://example.com/x' },
      { fetchFn },
    )
    assert.equal(campaign.meta_message, 'Hello FB')

    const rows = await createCampaignMetaPublications(
      '01CAMP',
      { metaPageIds: ['01PAGE'], confirmRepublish: true },
      { fetchFn },
    )
    assert.equal(rows[0].status, 'queued')
    assert.equal(rows[0].simulated, true)
  })

  it('retries, reconciles, and resolves publications', async () => {
    const fetchFn = createFetchMock({
      'POST /api/v1/campaigns/01CAMP/meta/publications/01PUB/retry': jsonResponse(200, {
        data: { id: '01PUB', status: 'queued' },
      }),
      'POST /api/v1/campaigns/01CAMP/meta/publications/01PUB/reconcile': jsonResponse(200, {
        data: { id: '01PUB', status: 'published', provider_post_id: 'simulated_post_1' },
      }),
      'POST /api/v1/campaigns/01CAMP/meta/publications/01PUB/resolve': async (_url, options) => {
        const body = JSON.parse(options.body)
        if (body.resolution === 'mark_failed') {
          assert.equal(body.acknowledge_duplicate_risk, true)
          return jsonResponse(200, { data: { id: '01PUB', status: 'failed' } })
        }
        assert.equal(body.resolution, 'mark_published')
        assert.equal(body.acknowledge_verified_on_facebook, true)
        assert.equal(body.provider_post_id, 'post_123')
        return jsonResponse(200, {
          data: { id: '01PUB', status: 'published', provider_post_id: 'post_123' },
        })
      },
    })

    const { resolveCampaignMetaPublication } = await import('./campaignMetaApi.js')

    const retried = await retryCampaignMetaPublication('01CAMP', '01PUB', { fetchFn })
    assert.equal(retried.status, 'queued')

    const reconciled = await reconcileCampaignMetaPublication('01CAMP', '01PUB', { fetchFn })
    assert.equal(reconciled.status, 'published')

    const failed = await resolveCampaignMetaPublication(
      '01CAMP',
      '01PUB',
      { resolution: 'mark_failed', acknowledgeDuplicateRisk: true },
      { fetchFn },
    )
    assert.equal(failed.status, 'failed')

    const published = await resolveCampaignMetaPublication(
      '01CAMP',
      '01PUB',
      {
        resolution: 'mark_published',
        acknowledgeVerifiedOnFacebook: true,
        providerPostId: 'post_123',
      },
      { fetchFn },
    )
    assert.equal(published.status, 'published')
    assert.equal(published.provider_post_id, 'post_123')
  })

  it('rejects empty campaign ids and surfaces API errors', async () => {
    await assert.rejects(() => getCampaignMetaEligiblePages(''), (err) => {
      assert.ok(err instanceof ApiError)
      return /campaign is required/i.test(err.message)
    })

    const fetchFn = createFetchMock({
      'GET /api/v1/campaigns/01CAMP/meta/eligible-pages': jsonResponse(422, {
        message: 'Meta reconnection required.',
      }),
    })

    await assert.rejects(() => getCampaignMetaEligiblePages('01CAMP', { fetchFn }), (err) => {
      assert.ok(err instanceof ApiError)
      return /reconnection required/i.test(err.message)
    })
  })

  it('appends UTMs without overwriting query or fragment', () => {
    const withQuery = appendUtmParams('https://example.com/path?x=1#frag', {
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: '01CAMP',
    })
    assert.match(withQuery, /x=1/)
    assert.match(withQuery, /utm_source=facebook/)
    assert.match(withQuery, /#frag$/)

    const preservesExisting = appendUtmParams('https://example.com/?utm_source=manual', {
      utm_source: 'facebook',
      utm_medium: 'social',
    })
    assert.match(preservesExisting, /utm_source=manual/)
    assert.match(preservesExisting, /utm_medium=social/)
    assert.equal(preservesExisting.includes('utm_source=facebook'), false)
  })

  it('labels publication statuses for the UI', () => {
    assert.equal(publicationStatusLabel('outcome_unknown'), 'Outcome unknown')
    assert.equal(publicationStatusLabel('published'), 'Published')
    assert.equal(publicationStatusLabel('queued'), 'Queued')
  })
})
