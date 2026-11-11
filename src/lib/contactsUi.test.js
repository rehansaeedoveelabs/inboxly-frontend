import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  appendUniqueById,
  consentEmailFilterForTab,
  consentStatus,
  formatConsentSummary,
  formatContactName,
  isMarketingEligible,
  requiresConsentReview,
} from './contactsUi.js'

describe('contactsUi', () => {
  it('formats names from snake_case fields with email/phone fallbacks', () => {
    assert.equal(formatContactName({ first_name: 'Jane', last_name: 'Doe' }), 'Jane Doe')
    assert.equal(formatContactName({ first_name: null, last_name: '', email: 'a@b.co' }), 'a@b.co')
    assert.equal(formatContactName({ phone: '+1555' }), '+1555')
    assert.equal(formatContactName({}), 'Unnamed contact')
  })

  it('reads consent status without inventing subscribed', () => {
    assert.equal(consentStatus(null, 'email'), null)
    assert.equal(consentStatus({ consents: {} }, 'email'), null)
    assert.equal(
      consentStatus({ consents: { email: { status: 'nonsubscribed' } } }, 'email'),
      'nonsubscribed',
    )
    assert.equal(
      consentStatus({ consents: { sms: { status: 'subscribed' } } }, 'sms'),
      'subscribed',
    )
  })

  it('maps list tabs to backend consent_email values only', () => {
    assert.equal(consentEmailFilterForTab('all'), undefined)
    assert.equal(consentEmailFilterForTab('email'), 'subscribed')
    assert.equal(consentEmailFilterForTab('email_nonsubscribed'), 'nonsubscribed')
  })

  it('appends pages without duplicate ids', () => {
    const first = [{ id: 'a' }, { id: 'b' }]
    const second = [{ id: 'b' }, { id: 'c' }]
    assert.deepEqual(appendUniqueById(first, second).map((r) => r.id), ['a', 'b', 'c'])
    assert.deepEqual(appendUniqueById([], [{ id: 'x' }, { id: 'x' }]).map((r) => r.id), ['x'])
    assert.deepEqual(appendUniqueById(null, null), [])
  })

  it('detects consent review gate and marketing eligibility', () => {
    assert.equal(requiresConsentReview(null), false)
    assert.equal(requiresConsentReview({ consent_review_required: true }), true)
    assert.equal(
      requiresConsentReview({ consent_review_required_at: '2026-11-11T12:00:00Z' }),
      true,
    )
    assert.equal(isMarketingEligible({ marketing_eligible: { email: true } }, 'email'), true)
    assert.equal(isMarketingEligible({ marketing_eligible: { email: false } }, 'email'), false)
    assert.equal(
      formatConsentSummary({
        consents: {
          email: { status: 'subscribed' },
          sms: { status: 'unsubscribed' },
        },
      }),
      'email: subscribed · sms: unsubscribed · push: unknown',
    )
  })
})
