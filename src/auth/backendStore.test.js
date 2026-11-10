import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { findActiveBackendStoreId, userHasWorkspace } from './backendStore.js'

describe('backendStore helpers', () => {
  it('never invents store ids from missing workspace data', () => {
    assert.equal(findActiveBackendStoreId(null), null)
    assert.equal(findActiveBackendStoreId({ workspaces: [] }), null)
    assert.equal(
      findActiveBackendStoreId({
        workspaces: [{ id: '01WS', active_store_id: null }],
      }),
      null,
    )
  })

  it('returns the first real active_store_id ULID', () => {
    assert.equal(
      findActiveBackendStoreId({
        workspaces: [
          { id: '01WS', active_store_id: null },
          { id: '01WS2', active_store_id: '01REALSTORE' },
        ],
      }),
      '01REALSTORE',
    )
  })

  it('detects whether the user has any workspace', () => {
    assert.equal(userHasWorkspace({ workspaces: [{ id: '01WS' }] }), true)
    assert.equal(userHasWorkspace({ workspaces: [] }), false)
    assert.equal(userHasWorkspace(null), false)
  })
})
