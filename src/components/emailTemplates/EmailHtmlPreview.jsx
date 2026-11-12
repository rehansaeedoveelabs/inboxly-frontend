import { useEffect, useRef, useState } from 'react'
import { downloadAsset } from '../../lib/assetsApi'
import { resolveAssetPlaceholders } from '../../lib/emailTemplatesApi'

/**
 * Renders sanitized template HTML and rewrites private asset placeholders.
 */
export function EmailHtmlPreview({ html, className = '' }) {
  const [resolved, setResolved] = useState(html || '')
  const urlsRef = useRef([])

  useEffect(() => {
    let cancelled = false
    const localUrls = []

    async function run() {
      const next = await resolveAssetPlaceholders(html || '', async (assetId) => {
        try {
          const { blob } = await downloadAsset(assetId)
          const url = URL.createObjectURL(blob)
          localUrls.push(url)
          return url
        } catch {
          return null
        }
      })
      if (!cancelled) {
        for (const url of urlsRef.current) URL.revokeObjectURL(url)
        urlsRef.current = localUrls
        setResolved(next)
      } else {
        for (const url of localUrls) URL.revokeObjectURL(url)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [html])

  useEffect(
    () => () => {
      for (const url of urlsRef.current) URL.revokeObjectURL(url)
      urlsRef.current = []
    },
    [],
  )

  return (
    <iframe
      title="Email preview"
      className={`w-full rounded-md border border-line bg-white ${className}`}
      sandbox=""
      srcDoc={resolved || '<p style="font-family:sans-serif;color:#666;padding:16px;">No preview</p>'}
    />
  )
}
