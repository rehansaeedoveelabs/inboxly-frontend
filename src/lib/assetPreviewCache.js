import { downloadAsset } from './assetsApi.js'

/**
 * Shared authenticated asset previews with client-side thumbnail scaling.
 * One network download per asset; UI thumbs reuse a downscaled JPEG.
 */

/** @type {Map<string, Promise<Blob>>} */
const sourceInflight = new Map()

/** @type {Map<string, Blob>} */
const sourceBlobs = new Map()

/** @type {Map<string, { url: string, refs: number }>} */
const urlCache = new Map()

/** @type {Map<string, Promise<string>>} */
const urlInflight = new Map()

/**
 * @param {string} assetId
 * @returns {Promise<Blob>}
 */
async function getSourceBlob(assetId) {
  const hit = sourceBlobs.get(assetId)
  if (hit) return hit

  const existing = sourceInflight.get(assetId)
  if (existing) return existing

  const promise = downloadAsset(assetId).then(({ blob }) => {
    sourceBlobs.set(assetId, blob)
    return blob
  })
  sourceInflight.set(assetId, promise)
  try {
    return await promise
  } finally {
    sourceInflight.delete(assetId)
  }
}

/**
 * @param {Blob} blob
 * @param {number} maxEdge
 * @returns {Promise<Blob>}
 */
async function downscaleBlob(blob, maxEdge) {
  if (!(maxEdge > 0)) return blob

  let width = 0
  let height = 0
  /** @type {CanvasImageSource | null} */
  let source = null
  /** @type {ImageBitmap | null} */
  let bitmap = null

  if (typeof createImageBitmap === 'function') {
    try {
      bitmap = await createImageBitmap(blob)
      width = bitmap.width
      height = bitmap.height
      source = bitmap
    } catch {
      bitmap = null
    }
  }

  if (!source) {
    const objectUrl = URL.createObjectURL(blob)
    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('decode failed'))
        img.src = objectUrl
      })
      width = image.naturalWidth || image.width
      height = image.naturalHeight || image.height
      source = image
    } catch {
      URL.revokeObjectURL(objectUrl)
      return blob
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }

  const longest = Math.max(width, height)
  if (!longest || longest <= maxEdge) {
    bitmap?.close?.()
    return blob
  }

  const scale = maxEdge / longest
  const nextW = Math.max(1, Math.round(width * scale))
  const nextH = Math.max(1, Math.round(height * scale))

  /** @type {OffscreenCanvas | HTMLCanvasElement} */
  let canvas
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(nextW, nextH)
  } else if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas')
    canvas.width = nextW
    canvas.height = nextH
  } else {
    bitmap?.close?.()
    return blob
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap?.close?.()
    return blob
  }
  ctx.drawImage(source, 0, 0, nextW, nextH)
  bitmap?.close?.()

  if ('convertToBlob' in canvas && typeof canvas.convertToBlob === 'function') {
    try {
      return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.72 })
    } catch {
      return blob
    }
  }

  return await new Promise((resolve) => {
    canvas.toBlob(
      (next) => resolve(next || blob),
      'image/jpeg',
      0.72,
    )
  })
}

/**
 * @param {string} assetId
 * @param {{ maxEdge?: number }} [options]  maxEdge>0 → scaled thumbnail
 * @returns {Promise<string>} shared object URL (release with releaseAssetPreviewUrl)
 */
export async function getAssetPreviewUrl(assetId, options = {}) {
  const id = typeof assetId === 'string' ? assetId.trim() : ''
  if (!id) throw new Error('An asset id is required.')

  const maxEdge = typeof options.maxEdge === 'number' && options.maxEdge > 0 ? Math.round(options.maxEdge) : 0
  const key = `${maxEdge}:${id}`

  const hit = urlCache.get(key)
  if (hit) {
    hit.refs += 1
    return hit.url
  }

  const existing = urlInflight.get(key)
  if (existing) {
    const url = await existing
    const again = urlCache.get(key)
    if (again) again.refs += 1
    return url
  }

  const promise = (async () => {
    const source = await getSourceBlob(id)
    const prepared = await downscaleBlob(source, maxEdge)
    const url = URL.createObjectURL(prepared)
    urlCache.set(key, { url, refs: 0 })
    return url
  })()

  urlInflight.set(key, promise)
  try {
    const url = await promise
    const entry = urlCache.get(key)
    if (entry) entry.refs += 1
    return url
  } finally {
    urlInflight.delete(key)
  }
}

/**
 * @param {string} url
 */
export function releaseAssetPreviewUrl(url) {
  if (!url) return
  for (const [key, entry] of urlCache.entries()) {
    if (entry.url !== url) continue
    entry.refs = Math.max(0, entry.refs - 1)
    if (entry.refs === 0) {
      URL.revokeObjectURL(entry.url)
      urlCache.delete(key)
    }
    return
  }
}
