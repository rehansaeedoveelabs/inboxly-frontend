import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ASSET_MAX_BYTES,
  formatAssetMeta,
  listStoreAssets,
  uploadStoreAsset,
  validateAssetFile,
} from './assetsApi.js'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createFetchMock(handlers) {
  return async (url, options = {}) => {
    if (String(url).includes('/sanctum/csrf-cookie')) {
      return new Response(null, { status: 204 })
    }
    const method = options.method || 'GET'
    const key = `${method} ${url}`
    const handler = handlers[key]
    if (!handler) throw new Error(`Unexpected fetch: ${key}`)
    return typeof handler === 'function' ? handler(url, options) : handler
  }
}

describe('assetsApi', () => {
  it('validates file type and size', () => {
    assert.equal(validateAssetFile(null), 'Choose an image file.')
    assert.match(
      validateAssetFile({ type: 'text/plain', size: 10 }),
      /JPEG, PNG, GIF, and WebP/,
    )
    assert.match(
      validateAssetFile({ type: 'image/png', size: ASSET_MAX_BYTES + 1 }),
      /5 MB/,
    )
    assert.equal(validateAssetFile({ type: 'image/png', size: 100 }), null)
  })

  it('lists assets with search query', async () => {
    const fetchFn = createFetchMock({
      'GET /api/v1/stores/01STORE/assets?q=hero&limit=25': jsonResponse(200, {
        data: [{ id: '01ASSET', name: 'hero' }],
        meta: { next_cursor: null },
        links: {},
      }),
    })

    const page = await listStoreAssets('01STORE', { q: 'hero' }, { fetchFn })
    assert.equal(page.data[0].id, '01ASSET')
  })

  it('uploads multipart without forcing JSON content-type', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'hero.png', { type: 'image/png' })
    let sawFormData = false
    const fetchFn = createFetchMock({
      'POST /api/v1/stores/01STORE/assets': (_url, options) => {
        sawFormData = options.body instanceof FormData
        assert.equal(options.headers?.['Content-Type'], undefined)
        return jsonResponse(201, {
          data: { id: '01ASSET', name: 'hero', mime_type: 'image/png' },
        })
      },
    })

    const asset = await uploadStoreAsset('01STORE', { file, alt: 'Hero' }, { fetchFn })
    assert.equal(sawFormData, true)
    assert.equal(asset.id, '01ASSET')
  })

  it('formats asset meta', () => {
    assert.equal(formatAssetMeta({ width: 800, height: 600, byte_size: 2048 }), '800×600 · 2 KB')
  })
})
