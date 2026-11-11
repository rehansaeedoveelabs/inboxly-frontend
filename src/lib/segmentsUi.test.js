import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  defaultSegmentRules,
  filterSegments,
  opsForField,
  toApiRules,
  toDraftRules,
} from './segmentsUi.js'

describe('segmentsUi', () => {
  it('builds default consent.email subscribed rules', () => {
    assert.deepEqual(defaultSegmentRules(), {
      operator: 'and',
      conditions: [{ field: 'consent.email', op: 'eq', value: 'subscribed' }],
    })
  })

  it('limits consent fields to allowed ops', () => {
    const ops = opsForField('consent.sms').map((o) => o.value)
    assert.ok(ops.includes('eq'))
    assert.ok(!ops.includes('contains'))
  })

  it('converts list values and null ops for the API', () => {
    assert.deepEqual(
      toApiRules({
        operator: 'or',
        conditions: [
          { field: 'tag', op: 'in', value: 'vip, loyalty' },
          { field: 'phone', op: 'is_null', value: 'ignored' },
          { field: 'email', op: 'contains', value: '@x.com' },
        ],
      }),
      {
        operator: 'or',
        conditions: [
          { field: 'tag', op: 'in', value: ['vip', 'loyalty'] },
          { field: 'phone', op: 'is_null' },
          { field: 'email', op: 'contains', value: '@x.com' },
        ],
      },
    )
  })

  it('round-trips draft rules for editing', () => {
    const api = {
      operator: 'and',
      conditions: [{ field: 'tag', op: 'in', value: ['vip', 'a'] }],
    }
    assert.deepEqual(toDraftRules(api), {
      operator: 'and',
      conditions: [{ field: 'tag', op: 'in', value: 'vip, a' }],
    })
  })

  it('filters segments by name/description', () => {
    const segments = [
      { name: 'VIP buyers', description: 'high intent' },
      { name: 'Gmail', description: null },
    ]
    assert.equal(filterSegments(segments, 'vip').length, 1)
    assert.equal(filterSegments(segments, '').length, 2)
  })
})
