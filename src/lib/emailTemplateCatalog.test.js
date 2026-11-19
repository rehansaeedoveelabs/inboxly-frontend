import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BUILTIN_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_CATEGORIES,
  EMAIL_TEMPLATE_STYLES,
  buildEmailDocument,
  filterBuiltinEmailTemplates,
  personalizeEmailDocument,
  personalizeMergeTags,
} from './emailTemplateCatalog.js'

describe('emailTemplateCatalog', () => {
  it('ships styles, categories, and a full built-in set', () => {
    assert.equal(EMAIL_TEMPLATE_STYLES.length, 4)
    assert.ok(EMAIL_TEMPLATE_CATEGORIES.length >= 8)
    assert.ok(BUILTIN_EMAIL_TEMPLATES.length >= 36)

    const ids = new Set(BUILTIN_EMAIL_TEMPLATES.map((item) => item.id))
    assert.equal(ids.size, BUILTIN_EMAIL_TEMPLATES.length)

    for (const style of EMAIL_TEMPLATE_STYLES) {
      assert.ok(
        BUILTIN_EMAIL_TEMPLATES.some((item) => item.style === style.id),
        `missing templates for style ${style.id}`,
      )
    }

    for (const category of EMAIL_TEMPLATE_CATEGORIES) {
      if (category.id === 'all' || category.id === 'yours') continue
      assert.ok(
        BUILTIN_EMAIL_TEMPLATES.some((item) => item.category === category.id),
        `missing templates for category ${category.id}`,
      )
    }

    assert.ok(BUILTIN_EMAIL_TEMPLATES.some((item) => item.badge === 'Premium'))
  })

  it('builds premium block documents', () => {
    const doc = buildEmailDocument({
      eyebrow: 'Welcome',
      headline: 'Hello {{first_name}}',
      subhead: 'A refined start',
      body: 'Welcome to {{shop_name}}',
      highlight: 'Code <strong>{{discount_code}}</strong>',
      ctaLabel: 'Shop',
    })
    assert.equal(doc.version, 1)
    assert.equal(doc.settings.width, 600)
    assert.ok(doc.blocks.some((block) => block.type === 'header'))
    assert.ok(doc.blocks.some((block) => block.type === 'button'))
    assert.ok(doc.blocks.every((block) => typeof block.id === 'string' && block.id.length > 0))
  })

  it('filters by style, category, and search', () => {
    const premium = filterBuiltinEmailTemplates({
      style: 'premium',
      category: 'all',
    })
    assert.ok(premium.length >= 6)
    assert.ok(premium.every((item) => item.style === 'premium'))

    const search = filterBuiltinEmailTemplates({ style: 'standard', category: 'all', q: 'black friday' })
    assert.ok(search.some((item) => item.id === 'seasonal-black-friday'))
  })

  it('personalizes merge tags for merchant live preview', () => {
    const source = BUILTIN_EMAIL_TEMPLATES.find((item) => item.id === 'welcome-hello')
    const personalized = personalizeEmailDocument(source.document, {
      shopName: 'oveelab',
      firstName: 'Rehan',
      discountCode: 'HELLO10',
      address: '1 Main St',
      city: 'Lahore',
      country: 'Pakistan',
    })
    const blob = JSON.stringify(personalized)
    assert.ok(blob.includes('oveelab'))
    assert.ok(blob.includes('Rehan'))
    assert.ok(blob.includes('HELLO10'))
    assert.ok(blob.includes('Lahore'))
    assert.equal(blob.includes('{{shop_name}}'), false)
    assert.equal(JSON.stringify(source.document).includes('{{shop_name}}'), true)

    const spaced = personalizeMergeTags('Hello {{ SHOP_NAME }} and {{first_name}}', {
      shopName: 'oveelab',
      firstName: 'Alex',
    })
    assert.equal(spaced, 'Hello oveelab and Alex')
  })
})
