import { useEffect, useMemo, useRef, useState } from 'react'
import { getAssetPreviewUrl, releaseAssetPreviewUrl } from '../../lib/assetPreviewCache'
import { resolveAssetPlaceholders } from '../../lib/emailTemplatesApi'
import { cn } from '../../lib/cn'
import { IPhone16ProMaxFrame } from './IPhone16ProMaxFrame'

const MOBILE_RESPONSIVE_CSS = `
html {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  background: #ffffff !important;
  -webkit-text-size-adjust: 100%;
}
body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100% !important;
  overflow-x: hidden !important;
  background: #ffffff !important;
}
table {
  max-width: 100% !important;
  width: 100% !important;
}
td, th {
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
}
img {
  max-width: 100% !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
a {
  word-break: break-word !important;
}
`

function withMobileResponsiveCss(html) {
  const source = typeof html === 'string' && html.trim() !== '' ? html : '<p style="font-family:sans-serif;color:#666;padding:16px;">No preview</p>'
  const styleTag = `<style id="inboxly-mobile-preview">${MOBILE_RESPONSIVE_CSS}</style>`
  if (/<head[\s>]/i.test(source)) {
    return source.replace(/<head([^>]*)>/i, `<head$1>${styleTag}`)
  }
  if (/<html[\s>]/i.test(source)) {
    return source.replace(/<html([^>]*)>/i, `<html$1><head>${styleTag}</head>`)
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${styleTag}</head><body>${source}</body></html>`
}

/**
 * Renders sanitized template HTML and rewrites private asset placeholders.
 *
 * @param {{
 *   html?: string,
 *   className?: string,
 *   viewport?: 'desktop' | 'mobile',
 * }} props
 */
export function EmailHtmlPreview({ html, className = '', viewport = 'desktop' }) {
  const [resolved, setResolved] = useState(html || '')
  const urlsRef = useRef([])
  const isMobile = viewport === 'mobile'

  useEffect(() => {
    let cancelled = false
    const localUrls = []
    // Show the latest HTML immediately so merge-tag personalization is not delayed.
    setResolved(html || '')

    async function run() {
      const next = await resolveAssetPlaceholders(html || '', async (assetId) => {
        try {
          // Studio preview: cap decode size so large uploads don't stall the canvas.
          const url = await getAssetPreviewUrl(assetId, { maxEdge: 1200 })
          localUrls.push(url)
          return url
        } catch {
          return null
        }
      })
      if (!cancelled) {
        for (const url of urlsRef.current) releaseAssetPreviewUrl(url)
        urlsRef.current = localUrls
        setResolved(next)
      } else {
        for (const url of localUrls) releaseAssetPreviewUrl(url)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [html])

  useEffect(
    () => () => {
      for (const url of urlsRef.current) releaseAssetPreviewUrl(url)
      urlsRef.current = []
    },
    [],
  )

  const srcDoc = useMemo(() => {
    if (isMobile) return withMobileResponsiveCss(resolved)
    return (
      resolved ||
      '<p style="font-family:sans-serif;color:#666;padding:16px;">No preview</p>'
    )
  }, [isMobile, resolved])

  const iframe = (
    <iframe
      title={isMobile ? 'Email preview · iPhone 16 Pro Max' : 'Email preview'}
      className={cn(
        'w-full border-0 bg-white',
        isMobile ? 'h-full min-h-0' : 'min-h-[560px] rounded-md border border-line',
      )}
      // allow-same-origin is required so blob: asset previews (from the parent
      // page) can load inside srcDoc. Scripts stay blocked.
      sandbox="allow-same-origin"
      srcDoc={srcDoc}
    />
  )

  if (isMobile) {
    return (
      <div className={cn('mx-auto', className)}>
        <IPhone16ProMaxFrame displayWidth={300}>
          <div className="h-full min-h-0 w-full">{iframe}</div>
        </IPhone16ProMaxFrame>
      </div>
    )
  }

  return <div className={cn('mx-auto w-full', className || 'max-w-[640px]')}>{iframe}</div>
}
