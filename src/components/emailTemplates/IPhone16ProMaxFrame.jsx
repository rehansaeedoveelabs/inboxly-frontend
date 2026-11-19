import { cn } from '../../lib/cn'

/** Logical CSS points for iPhone 16 Pro Max. */
export const IPHONE_16_PRO_MAX = {
  width: 430,
  height: 932,
}

/**
 * Visual chrome for iPhone 16 Pro Max.
 * Renders at true device points, then scales down so it fits the studio canvas.
 *
 * @param {{
 *   children: import('react').ReactNode,
 *   className?: string,
 *   displayWidth?: number,
 * }} props
 */
export function IPhone16ProMaxFrame({ children, className, displayWidth = 300 }) {
  const { width: deviceW, height: deviceH } = IPHONE_16_PRO_MAX
  const scale = Math.min(1, displayWidth / deviceW)
  const outerW = Math.round(deviceW * scale)
  const outerH = Math.round(deviceH * scale)

  return (
    <div
      className={cn('mx-auto', className)}
      style={{ width: outerW }}
      aria-label="iPhone 16 Pro Max preview"
    >
      <div className="relative" style={{ width: outerW, height: outerH }}>
        <div
          className="absolute top-0 left-0 overflow-hidden rounded-[3.25rem] p-[12px]"
          style={{
            width: deviceW,
            height: deviceH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: 'linear-gradient(160deg, #3a3a3c 0%, #1c1c1e 42%, #0b0b0c 100%)',
            boxShadow:
              'inset 0 0 0 1px rgba(255,255,255,0.08), 0 25px 80px -20px rgba(0,0,0,0.65)',
          }}
        >
          {/* Side buttons (visual only) */}
          <span className="absolute top-[140px] -left-[2px] h-8 w-[3px] rounded-l-sm bg-[#2c2c2e]" />
          <span className="absolute top-[190px] -left-[2px] h-14 w-[3px] rounded-l-sm bg-[#2c2c2e]" />
          <span className="absolute top-[260px] -left-[2px] h-14 w-[3px] rounded-l-sm bg-[#2c2c2e]" />
          <span className="absolute top-[220px] -right-[2px] h-20 w-[3px] rounded-r-sm bg-[#2c2c2e]" />

          <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2.55rem] bg-black">
            {/* Dynamic Island */}
            <div className="pointer-events-none absolute top-3 left-1/2 z-20 h-[34px] w-[126px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <span className="absolute top-1/2 right-4 size-2.5 -translate-y-1/2 rounded-full bg-[#1a1a1a] ring-1 ring-white/10" />
            </div>

            {/* Status bar spacer under the island */}
            <div className="h-12 shrink-0 bg-white" aria-hidden />

            {/* Screen — children fill; scroll happens inside the iframe */}
            <div className="relative min-h-0 flex-1 overflow-hidden bg-white">{children}</div>

            {/* Home indicator */}
            <div className="flex shrink-0 justify-center bg-white pb-2.5 pt-1.5" aria-hidden>
              <span className="h-[5px] w-[134px] rounded-full bg-black/80" />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted">iPhone 16 Pro Max</p>
    </div>
  )
}
