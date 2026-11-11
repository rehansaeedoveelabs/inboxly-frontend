import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  STARTER_CATEGORIES,
  STARTER_MESSAGES,
  filterStarterMessages,
  hasWritableCampaignContent,
  scratchFormFields,
  starterToFormFields,
  startersForChannel,
} from './starterMessages.js'

describe('starterMessages', () => {
  it('includes 7 email and 5 SMS presets across all categories', () => {
    const email = startersForChannel('email')
    const sms = startersForChannel('sms')
    assert.equal(email.length, 7)
    assert.equal(sms.length, 5)
    assert.equal(STARTER_MESSAGES.length, 12)
    assert.equal(STARTER_CATEGORIES.length, 5)

    for (const category of STARTER_CATEGORIES) {
      assert.ok(
        STARTER_MESSAGES.some((item) => item.category === category.id),
        `missing category ${category.id}`,
      )
    }
  })

  it('filters by channel', () => {
    const email = filterStarterMessages({ channel: 'email' })
    const sms = filterStarterMessages({ channel: 'sms' })
    assert.equal(email.every((item) => item.channel === 'email'), true)
    assert.equal(sms.every((item) => item.channel === 'sms'), true)
    assert.equal(email.length, 7)
    assert.equal(sms.length, 5)
  })

  it('filters by category', () => {
    const welcomeEmail = filterStarterMessages({ channel: 'email', category: 'welcome' })
    assert.ok(welcomeEmail.length >= 1)
    assert.equal(welcomeEmail.every((item) => item.category === 'welcome'), true)

    const all = filterStarterMessages({ channel: 'email', category: 'all' })
    assert.equal(all.length, 7)
  })

  it('filters by search query against name and body', () => {
    const weekend = filterStarterMessages({ channel: 'email', query: 'weekend' })
    assert.ok(weekend.length >= 1)
    assert.ok(weekend.some((item) => /weekend/i.test(item.label + item.body + item.subject)))

    const none = filterStarterMessages({ channel: 'sms', query: 'zzzz-not-a-real-starter' })
    assert.equal(none.length, 0)
  })

  it('maps email starter fields for form prefill', () => {
    const starter = STARTER_MESSAGES.find((item) => item.id === 'email-launch-new')
    assert.ok(starter)
    const fields = starterToFormFields(starter)
    assert.equal(fields.name, starter.name)
    assert.equal(fields.subject, starter.subject)
    assert.equal(fields.previewText, starter.previewText)
    assert.equal(fields.body, starter.body)
  })

  it('keeps email-only fields empty when mapping SMS starters', () => {
    const starter = STARTER_MESSAGES.find((item) => item.id === 'sms-promo-flash')
    assert.ok(starter)
    assert.equal(starter.subject, null)
    assert.equal(starter.previewText, null)

    const fields = starterToFormFields(starter)
    assert.equal(fields.name, starter.name)
    assert.equal(fields.subject, '')
    assert.equal(fields.previewText, '')
    assert.equal(fields.body, starter.body)
  })

  it('provides start-from-scratch fields without leftover content', () => {
    const emailScratch = scratchFormFields('email')
    assert.deepEqual(emailScratch, {
      name: 'New email campaign',
      subject: '',
      previewText: '',
      body: '',
    })

    const smsScratch = scratchFormFields('sms')
    assert.deepEqual(smsScratch, {
      name: 'New SMS campaign',
      subject: '',
      previewText: '',
      body: '',
    })

    assert.equal(hasWritableCampaignContent(emailScratch, 'email'), false)
    assert.equal(hasWritableCampaignContent(smsScratch, 'sms'), false)
    assert.equal(
      hasWritableCampaignContent({ ...emailScratch, body: 'Hello' }, 'email'),
      true,
    )
    assert.equal(
      hasWritableCampaignContent({ ...emailScratch, subject: 'Hi' }, 'email'),
      true,
    )
  })
})
