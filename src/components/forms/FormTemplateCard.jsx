import { formTypeLabel } from '../../lib/formTemplateCatalog'
import { cn } from '../../lib/cn'

function isDarkBg(hex) {
  const value = (hex || '').toLowerCase()
  return ['#0b0b0b', '#12141c', '#0b1220', '#1a0f1c', '#10131c', '#0f172a', '#111111'].includes(value)
}

/**
 * Template gallery card — mini form preview + hover CTA.
 */
export function FormTemplateCard({ template, onUse, busy }) {
  const accent = template.definition?.theme?.accent || '#2878FF'
  const background = template.definition?.theme?.background || '#FFFFFF'
  const text = template.definition?.theme?.text || '#10131C'
  const dark = isDarkBg(background)
  const game = template.gamification
  const typeLabel = formTypeLabel(template.type)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-elevated transition duration-200 hover:-translate-y-0.5 hover:border-electric/45 hover:shadow-[0_18px_40px_-28px_rgba(40,120,255,0.45)]">
      <div
        className="relative flex min-h-[200px] flex-1 items-center justify-center px-4 py-5"
        style={{
          background: dark
            ? background
            : `linear-gradient(165deg, ${background} 0%, color-mix(in srgb, ${background} 55%, #f4f6fa) 100%)`,
        }}
      >
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-white/10 bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
            {typeLabel}
          </span>
          {template.highConverting ? (
            <span className="rounded-md bg-cantaloupe/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cantaloupe-ink uppercase">
              High converting
            </span>
          ) : null}
        </div>

        {template.badge && template.badge !== 'High converting' ? (
          <span className="absolute top-3 right-3 z-10 rounded-md bg-electric px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
            {template.badge}
          </span>
        ) : null}

        <div
          className={cn(
            'relative w-full overflow-hidden border shadow-[0_12px_28px_-16px_rgba(0,0,0,0.45)] transition duration-200 group-hover:scale-[1.02]',
            template.type === 'flyout' ? 'ml-auto max-w-[168px] rounded-l-xl rounded-r-md' : 'max-w-[210px] rounded-xl',
            template.type === 'embedded' && 'rounded-lg shadow-none border-black/10',
            template.type === 'fullscreen' && 'max-w-[240px]',
            game && 'grid grid-cols-[1.1fr_0.9fr] max-w-[260px]',
          )}
          style={{
            background: dark ? '#161922' : '#ffffff',
            borderColor: dark ? 'rgba(255,255,255,0.08)' : `${text}14`,
            color: dark ? '#ffffff' : text,
          }}
        >
          <div className="space-y-2 px-3.5 py-4 text-left">
            <p className="text-[11px] leading-snug font-bold tracking-tight uppercase line-clamp-3">
              {template.definition?.headline || template.name}
            </p>
            <p className="line-clamp-2 text-[10px] leading-relaxed opacity-65">
              {template.definition?.subheadline || template.description}
            </p>
            <div className="h-7 rounded-md border border-black/10 bg-white/90" />
            <div
              className="flex h-7 items-center justify-center rounded-md text-[10px] font-semibold text-white"
              style={{ background: accent }}
            >
              {template.definition?.button_label || 'Subscribe'}
            </div>
          </div>

          {game ? (
            <div className="flex items-center justify-center border-l border-black/5 bg-black/[0.03] p-2">
              <div
                className="flex size-16 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{
                  background: `conic-gradient(${accent}, #7a1528, ${accent}, #4a0e18, ${accent})`,
                }}
              >
                {String(game).slice(0, 1).toUpperCase()}
              </div>
            </div>
          ) : null}
        </div>

        <div className="absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-[#0b0f19]/80 via-[#0b0f19]/25 to-transparent px-4 pb-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            disabled={busy}
            onClick={() => onUse?.(template)}
            className="w-full max-w-[200px] rounded-lg bg-electric px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? 'Opening…' : 'Edit in Form builder'}
          </button>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-line px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
          {template.gamification ? <span>Gamification</span> : null}
          {template.countdown ? <span>· Countdown</span> : null}
          {template.mobileOnly ? <span>· Mobile</span> : null}
          {template.hasTeaser ? <span>· Teaser</span> : null}
          {template.multiStep ? <span>· Multi-step</span> : null}
        </div>
        <h3 className="text-sm font-semibold text-ink line-clamp-2">{template.name}</h3>
        <p className="text-xs leading-relaxed text-muted line-clamp-2">{template.description}</p>
      </div>
    </article>
  )
}
