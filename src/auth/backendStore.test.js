import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  findActiveBackendStoreId,
  getPrimaryWorkspace,
  userHasWorkspace,
} from './backendStore.js'

describe('backendStore helpers', () => {
  it('never invents store or workspace ids from missing data', () => {
    assert.equal(getPrimaryWorkspace(null), null)
    assert.equal(findActiveBackendStoreId(null), null)
    assert.equal(userHasWorkspace({ workspaces: [] }), false)
    assert.equal(
      findActiveBackendStoreId({
        workspaces: [{ id: '01WS', active_store_id: null }],
      }),
      null,
    )
  })

  it('returns the primary workspace and active store ULID when present', () => {
    const user = {
      workspaces: [
        { id: '01WS', name: 'Acme', active_store_id: '01REALSTORE' },
        { id: '01WS2', active_store_id: '01OTHER' },
      ],
    }

    assert.equal(getPrimaryWorkspace(user).id, '01WS')
    assert.equal(findActiveBackendStoreId(user), '01REALSTORE')
    assert.equal(userHasWorkspace(user), true)
  })
})
