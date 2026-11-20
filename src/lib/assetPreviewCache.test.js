import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('assetPreviewCache helpers', () => {
  it('module exports preview helpers', async () => {
    const mod = await import('./assetPreviewCache.js')
    assert.equal(typeof mod.getAssetPreviewUrl, 'function')
    assert.equal(typeof mod.releaseAssetPreviewUrl, 'function')
    assert.equal(typeof mod.seedAssetSourceBlob, 'function')
  })
})
