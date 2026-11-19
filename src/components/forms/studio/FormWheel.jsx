/**
 * Decorative prize wheel for gamification forms (canvas preview).
 */
export function FormWheel({ size = 220, segments = null, accent = '#C41E3A' }) {
  const prizes = segments || ['5% off', '10% off', '20% off', '30% off']
  const colors = ['#C41E3A', '#7A1528', '#E11D48', '#4A0E18']
  const slice = 360 / prizes.length

  const wedges = prizes.map((label, index) => {
    const start = index * slice
    const end = start + slice
    const mid = start + slice / 2
    return { label, start, end, mid, color: colors[index % colors.length] }
  })

  function polar(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function wedgePath(cx, cy, r, start, end) {
    const a = polar(cx, cy, r, start)
    const b = polar(cx, cy, r, end)
    const large = end - start > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`
  }

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r + 2} fill="#1a1a1a" />
        {wedges.map((wedge) => {
          const textPos = polar(cx, cy, r * 0.62, wedge.mid)
          return (
            <g key={wedge.label}>
              <path d={wedgePath(cx, cy, r, wedge.start, wedge.end)} fill={wedge.color} stroke="#fff" strokeWidth="1.5" />
              <text
                x={textPos.x}
                y={textPos.y}
                fill="#fff"
                fontSize={size < 180 ? 9 : 11}
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${wedge.mid} ${textPos.x} ${textPos.y})`}
              >
                {wedge.label}
              </text>
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={size * 0.08} fill="#fff" stroke={accent} strokeWidth="3" />
      </svg>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5"
        style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `14px solid ${accent}`,
        }}
      />
    </div>
  )
}

export function FormMysteryBoxes({ accent = '#2878FF' }) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed text-xs font-bold text-white"
          style={{ background: accent, borderColor: `${accent}99` }}
        >
          ?
        </div>
      ))}
    </div>
  )
}

export function FormScratchCard({ accent = '#2878FF' }) {
  return (
    <div
      className="flex h-36 w-full items-center justify-center rounded-xl border border-black/10 text-sm font-semibold text-white"
      style={{
        background: `repeating-linear-gradient(135deg, ${accent}, ${accent} 12px, #222 12px, #222 24px)`,
      }}
    >
      Scratch to reveal
    </div>
  )
}

export function FormCountdown({ accent = '#2878FF' }) {
  return (
    <div className="flex justify-center gap-2">
      {['00', '14', '32'].map((value, index) => (
        <div key={index} className="min-w-12 rounded-lg px-2 py-2 text-center text-white" style={{ background: accent }}>
          <div className="text-lg font-bold tabular-nums">{value}</div>
          <div className="text-[9px] uppercase opacity-80">{['Hrs', 'Min', 'Sec'][index]}</div>
        </div>
      ))}
    </div>
  )
}
