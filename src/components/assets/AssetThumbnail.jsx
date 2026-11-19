import { useEffect, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { getAssetPreviewUrl, releaseAssetPreviewUrl } from '../../lib/assetPreviewCache'
import { cn } from '../../lib/cn'

/**
 * Loads a private asset preview via authenticated download.
 * Uses a shared cache and optional client-side downscale for fast studio thumbs.
 *
 * @param {{
 *   assetId: string,
 *   alt?: string,
 *   className?: string,
 *   imgClassName?: string,
 *   maxEdge?: number,
 * }} props
 */
export function AssetThumbnail({
  assetId,
  alt = '',
  className = '',
  imgClassName = '',
  maxEdge = 320,
}) {
  const [url, setUrl] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!assetId) return undefined
    let cancelled = false
    let acquired = ''
    setFailed(false)
    setUrl('')

    getAssetPreviewUrl(assetId, { maxEdge })
      .then((next) => {
        if (cancelled) {
          releaseAssetPreviewUrl(next)
          return
        }
        acquired = next
        setUrl(next)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (acquired) releaseAssetPreviewUrl(acquired)
    }
  }, [assetId, maxEdge])

  return (
    <div className={cn('flex items-center justify-center overflow-hidden bg-midnight', className)}>
      {url ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn('max-h-full max-w-full object-contain', imgClassName)}
        />
      ) : failed ? (
        <ImageIcon className="size-6 text-muted" />
      ) : (
        <span className="text-xs text-muted">Loading…</span>
      )}
    </div>
  )
}
