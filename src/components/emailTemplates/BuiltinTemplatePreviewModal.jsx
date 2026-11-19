import { useEffect, useState } from 'react'
import { Monitor, Smartphone, X } from 'lucide-react'
import { Button, LoadingState } from '../ui'
import { ApiError } from '../../lib/api'
import { cn } from '../../lib/cn'
import { personalizeEmailDocument } from '../../lib/emailTemplateCatalog'
import { previewEmailDocument } from '../../lib/emailTemplatesApi'
import { EmailHtmlPreview } from './EmailHtmlPreview'

/**
 * Live merchant preview for a built-in template before creating a store copy.
 * Layout mirrors common ESP galleries: title, desktop/mobile toggle, framed preview.
 */
export function BuiltinTemplatePreviewModal({
  open,
  template,
  storeId,
  shopName,
  onClose,
  onUse,
  using,
  chooseLabel = 'Choose template',
}) {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewport, setViewport] = useState('desktop')

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !template || !storeId) return undefined

    let cancelled = false
    setLoading(true)
    setError('')
    setHtml('')
    setViewport('desktop')

    const personalized = personalizeEmailDocument(template.document, {
      shopName: shopName || 'Your shop',
      firstName: 'Alex',
      discountCode: 'SAVE20',
    })

    previewEmailDocument(storeId, personalized)
      .then((result) => {
        if (!cancelled) setHtml(result.html)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Unable to render live preview.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, template, storeId, shopName])

  if (!open || !template) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={template.name}
        className="relative z-10 flex max-h-[min(920px,calc(100dvh-1.5rem))] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-elevated shadow-2xl"
      >
        <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="min-w-0 truncate text-sm font-semibold text-ink sm:text-base">
            {template.name}
          </h2>

          <div className="absolute left-1/2 flex -translate-x-1/2 items-center rounded-md border border-line bg-midnight p-0.5">
            <button
              type="button"
              aria-label="Desktop preview"
              aria-pressed={viewport === 'desktop'}
              onClick={() => setViewport('desktop')}
              className={cn(
                'rounded-sm p-1.5 transition-colors',
                viewport === 'desktop' ? 'bg-secondary text-ink' : 'text-muted hover:text-ink',
              )}
            >
              <Monitor className="size-4" />
            </button>
            <button
              type="button"
              aria-label="iPhone 16 Pro Max preview"
              aria-pressed={viewport === 'mobile'}
              onClick={() => setViewport('mobile')}
              className={cn(
                'rounded-sm p-1.5 transition-colors',
                viewport === 'mobile' ? 'bg-secondary text-ink' : 'text-muted hover:text-ink',
              )}
            >
              <Smartphone className="size-4" />
            </button>
          </div>

          <Button variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-secondary/40 px-3 py-4 scrollbar-thin sm:px-6 sm:py-5">
          <p className="mb-4 text-center text-xs text-muted sm:text-sm">
            Live preview for{' '}
            <span className="font-medium text-ink">{shopName || 'your shop'}</span>
            {' · '}
            sample customer Alex
            {viewport === 'mobile' ? ' · iPhone 16 Pro Max' : ''}
          </p>

          {error ? (
            <p className="text-center text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <LoadingState label="Rendering live preview…" />
          ) : (
            <div className={viewport === 'mobile' ? 'flex justify-center py-1' : undefined}>
              <EmailHtmlPreview html={html} viewport={viewport} />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-4 py-3">
          <Button variant="ghost" disabled={using} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={using || loading || Boolean(error)} onClick={() => onUse?.(template)}>
            {using ? 'Working…' : chooseLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
