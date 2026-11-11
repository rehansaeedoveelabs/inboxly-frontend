import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { filterTags, firstFieldError } from './tagsUi.js'

describe('tagsUi (Tags page helpers)', () => {
  const tags = [
    { id: '1', name: 'VIP' },
    { id: '2', name: 'source: shopify' },
    { id: '3', name: 'loyalty' },
    { id: '4', name: 'source: form' },
  ]

  it('returns all tags when filters are empty', () => {
    assert.equal(filterTags(tags).length, 4)
    assert.equal(filterTags(tags, { query: '', typeFilter: 'any' }).length, 4)
  })

  it('filters by search query (case-insensitive)', () => {
    assert.deepEqual(
      filterTags(tags, { query: 'vip' }).map((t) => t.id),
      ['1'],
    )
    assert.deepEqual(
      filterTags(tags, { query: 'SOURCE' }).map((t) => t.id),
      ['2', '4'],
    )
  })

  it('filters source vs custom tag types', () => {
    assert.deepEqual(
      filterTags(tags, { typeFilter: 'source' }).map((t) => t.id),
      ['2', '4'],
    )
    assert.deepEqual(
      filterTags(tags, { typeFilter: 'custom' }).map((t) => t.id),
      ['1', '3'],
    )
  })

  it('combines query and type filter', () => {
    assert.deepEqual(
      filterTags(tags, { query: 'lo', typeFilter: 'custom' }).map((t) => t.id),
      ['3'],
    )
    assert.deepEqual(filterTags(tags, { query: 'zzz', typeFilter: 'any' }), [])
  })

  it('handles empty and invalid tag lists as empty', () => {
    assert.deepEqual(filterTags([]), [])
    assert.deepEqual(filterTags(null), [])
  })

  it('reads the first Laravel field validation error', () => {
    assert.equal(firstFieldError(undefined, 'name'), undefined)
    assert.equal(firstFieldError({}, 'name'), undefined)
    assert.equal(
      firstFieldError({ name: ['A tag with this name already exists in the store.'] }, 'name'),
      'A tag with this name already exists in the store.',
    )
  })
})
