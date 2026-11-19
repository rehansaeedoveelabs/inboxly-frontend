/**
 * Premium gallery card with hover actions: Use template + Preview.
 */
export function BuiltinTemplateCard({ template, shopName, onPreview, onUse }) {
  const label = shopName || 'Your shop'
  const headline = (template.headline || '')
    .replaceAll('{{shop_name}}', label)
    .replaceAll('{{first_name}}', 'Alex')
    .replaceAll('{{discount_code}}', 'SAVE20')

  const isDarkCard =
    (template.background || '').toLowerCase() === '#1c1917' ||
    (template.background || '').toLowerCase() === '#171717'

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-elevated shadow-[0_10px_40px_-28px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-electric/50 hover:shadow-[0_22px_50px_-28px_rgba(40,120,255,0.35)]">
      <div
        className="relative flex min-h-[280px] flex-1 flex-col px-4 py-5"
        style={{
          background: isDarkCard
            ? template.background
            : `linear-gradient(180deg, ${template.background || '#f4f4f4'} 0%, #ffffff 78%)`,
        }}
      >
        {template.badge ? (
          <span className="absolute top-3 right-3 z-20 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur">
            {template.badge}
          </span>
        ) : null}

        <div className="mx-auto flex w-full max-w-[230px] flex-1 flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_12px_30px_-18px_rgba(0,0,0,0.45)]">
          <div
            className="px-4 py-6 text-center text-white"
            style={{ background: template.accent || '#0f3d2e' }}
          >
            <p className="mb-3 text-[9px] font-semibold tracking-[0.2em] uppercase opacity-85">
              {`{{shop_name}}`}
            </p>
            <p className="text-[15px] leading-snug font-semibold tracking-[-0.02em] break-words">
              {headline}
            </p>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-3 px-4 py-4">
            <p className="text-center text-[11px] leading-relaxed text-slate-600 line-clamp-3">
              {template.teaser}
            </p>
            <div
              className="mx-auto h-8 w-28 rounded-full"
              style={{ background: `${template.accent || '#0f3d2e'}18` }}
            />
          </div>
        </div>

        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-[#0b0f19]/72 px-5 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
          role="group"
          aria-label={`${template.name} actions`}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onUse?.(template)
            }}
            className="w-full max-w-[190px] rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            style={{ background: template.accent || '#14532d' }}
          >
            Use template
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onPreview?.(template)
            }}
            className="w-full max-w-[190px] rounded-lg border border-white/80 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/12"
          >
            Preview
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-midnight/35 px-4 py-3">
        <p className="truncate text-sm font-medium text-ink">{template.name}</p>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted uppercase">
          {template.style}
        </span>
      </div>
    </article>
  )
}

export function ScratchTemplateCard({ onSelect, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.()}
      className="group flex h-full min-h-[320px] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-dashed border-line bg-[linear-gradient(160deg,rgba(40,120,255,0.08),transparent_45%),linear-gradient(#191E2B,#141824)] px-5 py-10 text-center transition hover:border-electric hover:shadow-[0_22px_50px_-28px_rgba(40,120,255,0.35)] disabled:opacity-60"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl border border-electric/30 bg-electric/10 text-2xl text-electric transition group-hover:scale-105">
        +
      </span>
      <div>
        <p className="text-base font-semibold tracking-tight text-ink">Start from scratch</p>
        <p className="mt-1.5 max-w-[16rem] text-sm text-muted">
          Blank premium canvas with live desktop & iPhone preview
        </p>
      </div>
    </button>
  )
}
