import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  canReconcilePublication,
  canRetryPublication,
  defaultSelectedPageIds,
  publicationStatusTone,
} from './campaignMetaUi.js'

describe('campaignMetaUi', () => {
  it('defaults to default publishable page, then first publishable', () => {
    const pages = [
      { id: 'a', can_publish: false, is_default: true },
      { id: 'b', can_publish: true, is_default: false },
      { id: 'c', can_publish: true, is_default: true },
    ]
    assert.deepEqual(defaultSelectedPageIds(pages, []), ['c'])
    assert.deepEqual(defaultSelectedPageIds(pages.filter((p) => p.id !== 'c'), []), ['b'])
  })

  it('retains current selection when still publishable', () => {
    const pages = [
      { id: 'b', can_publish: true, is_default: true },
      { id: 'c', can_publish: true, is_default: false },
    ]
    assert.deepEqual(defaultSelectedPageIds(pages, ['c']), ['c'])
    assert.deepEqual(defaultSelectedPageIds(pages, ['gone']), ['b'])
  })

  it('maps status tones and recovery actions', () => {
    assert.equal(publicationStatusTone('published'), 'success')
    assert.equal(publicationStatusTone('failed'), 'danger')
    assert.equal(publicationStatusTone('outcome_unknown'), 'warning')
    assert.equal(publicationStatusTone('queued'), 'info')
    assert.equal(canRetryPublication({ status: 'failed' }), true)
    assert.equal(canRetryPublication({ status: 'published' }), false)
    assert.equal(canReconcilePublication({ status: 'outcome_unknown' }), true)
    assert.equal(canReconcilePublication({ status: 'failed' }), false)
  })
})
