import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BUILTIN_SMS_TEMPLATES,
  SMS_MERGE_TAG_GROUPS,
  filterBuiltinSmsTemplates,
  personalizeSmsBody,
  smsCategoryLabel,
  smsLengthStats,
} from './smsTemplateCatalog.js'

describe('smsTemplateCatalog', () => {
  it('includes seasonal, re-engagement, and welcome templates', () => {
    assert.ok(BUILTIN_SMS_TEMPLATES.length >= 30)
    assert.equal(smsCategoryLabel('abandoned_cart'), 'abandoned cart')
    assert.ok(BUILTIN_SMS_TEMPLATES.some((row) => row.category === 'seasonal'))
    assert.ok(BUILTIN_SMS_TEMPLATES.some((row) => row.category === 'welcome'))
    assert.ok(SMS_MERGE_TAG_GROUPS.some((group) => group.id === 'offer'))
  })

  it('filters by category and query', () => {
    const seasonal = filterBuiltinSmsTemplates({ category: 'seasonal' })
    assert.ok(seasonal.every((row) => row.category === 'seasonal'))
    assert.ok(seasonal.length >= 4)

    const search = filterBuiltinSmsTemplates({ query: 'black friday' })
    assert.equal(search.length, 1)
    assert.equal(search[0].name, 'Black Friday')
  })

  it('personalizes merge tags', () => {
    const out = personalizeSmsBody(
      'Hi {{first_name}} from {{shop_name}}: {{short_url}} code {{discount_code}}',
      {
        firstName: 'Ayesha',
        shopName: 'Acme Store',
        saleUrl: 'https://acme.pk',
        discountCode: 'SAVE20',
      },
    )
    assert.equal(out, 'Hi Ayesha from Acme Store: https://acme.pk code SAVE20')
  })

  it('counts GSM-7 SMS segments', () => {
    const short = smsLengthStats('Hello')
    assert.equal(short.encoding, 'GSM-7')
    assert.equal(short.segments, 1)

    const unicode = smsLengthStats('Eid Mubarak 🎉')
    assert.equal(unicode.encoding, 'UCS-2')
    assert.ok(unicode.segments >= 1)
  })
})
