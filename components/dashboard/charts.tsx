export function ScoreMeter({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative mx-auto w-full max-w-xs" role="img" aria-label={`Score ${score} out of 100`}>
      <svg viewBox="0 0 200 115" className="w-full" aria-hidden="true">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${score} 100`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="20" y="114" fontSize="9" fill="var(--muted-foreground)" textAnchor="middle">0</text>
        <text x="180" y="114" fontSize="9" fill="var(--muted-foreground)" textAnchor="middle">100</text>
      </svg>
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center">
        <p className="font-mono text-5xl font-semibold text-foreground">{score}</p>
        <p className="text-xs font-medium text-muted-foreground">out of 100</p>
      </div>
    </div>
  )
}

export function DonutChart({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1
  let used = 0
  return (
    <svg viewBox="0 0 42 42" className="mx-auto size-48 -rotate-90" role="img" aria-label="Principal versus interest">
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--muted)" strokeWidth="6" />
      {parts.map((p) => {
        const share = (p.value / total) * 100
        const el = (
          <circle
            key={p.label}
            cx="21"
            cy="21"
            r="15.9155"
            fill="none"
            stroke={p.color}
            strokeWidth="6"
            strokeDasharray={`${share} ${100 - share}`}
            strokeDashoffset={-used}
          />
        )
        used += share
        return el
      })}
    </svg>
  )
}

export function BarList({
  items,
}: {
  items: { label: string; value: number; max: number; color: string; text: string }[]
}) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((it) => (
        <li key={it.label} className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-2 text-sm">
            <span className="font-medium text-foreground">{it.label}</span>
            <span className="font-mono font-medium text-foreground">{it.text}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, (it.value / it.max) * 100))}%`,
                backgroundColor: it.color,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
