import { Badge, Button } from '../ui'
import { cn } from '../../lib/cn'
import { personalizeSmsBody, smsCategoryLabel } from '../../lib/smsTemplateCatalog'

/**
 * Gallery card for a built-in or saved SMS template.
 */
export function SmsTemplateCard({
  name,
  category,
  body,
  shopName,
  statusLabel: statusText,
  statusTone,
  disabled,
  onPreview,
  onUse,
  useLabel = 'Use this',
}) {
  const previewBody = personalizeSmsBody(body, {
    shopName,
    firstName: 'Ayesha',
    saleUrl: 'acme.pk/sale',
  })

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-elevated shadow-sm">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-ink">{name}</h3>
            <p className="mt-1 text-xs text-muted capitalize">{smsCategoryLabel(category)}</p>
          </div>
          {statusText ? (
            <Badge tone={statusTone || 'neutral'}>{statusText}</Badge>
          ) : (
            <Badge tone="neutral">{smsCategoryLabel(category)}</Badge>
          )}
        </div>

        <p className="text-xs font-medium text-muted">{shopName || 'Your shop'}</p>

        <p className="line-clamp-4 text-sm leading-relaxed text-ink">{previewBody}</p>
      </div>

      <div className="flex gap-2 border-t border-line px-3 py-2">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={disabled}
          onClick={onPreview}
        >
          Preview
        </Button>
        <Button className="flex-1" disabled={disabled} onClick={onUse}>
          {useLabel}
        </Button>
      </div>
    </article>
  )
}

/**
 * Empty “new template” tile.
 */
export function NewSmsTemplateCard({ disabled, onSelect }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-elevated/60 p-6 text-center transition',
        'hover:border-electric/50 hover:bg-electric/5 disabled:opacity-60',
      )}
    >
      <span className="text-base font-semibold text-ink">New template</span>
      <span className="max-w-[16rem] text-sm text-muted">
        Write your own reusable SMS message from scratch
      </span>
    </button>
  )
}
