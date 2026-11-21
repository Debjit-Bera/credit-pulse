'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useFinance } from '@/components/finance-provider'
import { fmt, pct, toneForRatio } from '@/lib/finance'
import { cn } from '@/lib/utils'
import { BarList, ScoreMeter } from './charts'
import { Badge, Card, Disclaimer, EmptyState, Loading, PageHeader, Stat, TONES, outlineBtn, primaryBtn } from './ui'

const BANDS = [
  { range: '0–34', label: 'Very High', tone: 'red' as const },
  { range: '35–54', label: 'High', tone: 'orange' as const },
  { range: '55–74', label: 'Moderate', tone: 'amber' as const },
  { range: '75–100', label: 'Low', tone: 'green' as const },
]

export function ScoreView() {
  const { ready, analysis: a, profile, rate } = useFinance()
  if (!ready) return <Loading />
  if (!a || !profile) return <EmptyState />

  return (
    <div>
      <PageHeader
        eyebrow="Credit score"
        title="Your CreditPulse score"
        subtitle="A score out of 100 built from five simple money ratios."
      />
      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="flex flex-col items-center gap-4 lg:col-span-2">
          <ScoreMeter score={a.score} color={TONES[a.risk.tone].stroke} />
          <Badge tone={a.risk.tone}>{a.risk.label}</Badge>
          <div className="grid w-full grid-cols-4 gap-1.5 text-center text-xs font-medium">
            {BANDS.map((b) => (
              <div key={b.range} className={cn('rounded-lg py-1.5', TONES[b.tone].soft, TONES[b.tone].text)}>
                <span className="block font-mono">{b.range}</span>
                {b.label}
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <h2 className="mb-5 font-bold text-foreground">Score breakdown</h2>
          <BarList
            items={a.breakdown.map((b) => ({
              label: b.label,
              value: b.points,
              max: b.max,
              color: TONES[toneForRatio(b.points / b.max)].stroke,
              text: `${b.points.toFixed(1)} / ${b.max}`,
            }))}
          />
          <ul className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
            {a.breakdown.map((b) => (
              <li key={b.key}>
                <span className="font-semibold text-foreground">{b.label}:</span> {b.note}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="New loan EMI" value={fmt(a.newEmi)} sub={`at ${rate}% for ${profile.tenure} months`} />
        <Stat label="Total EMI / income" value={pct(a.foir)} sub="existing + new EMI" />
        <Stat label="Expenses / income" value={pct(a.expenseRatio)} />
        <Stat label="Left each month" value={fmt(a.leftover)} sub="after expenses & EMIs" />
      </div>

      <p className="mt-6 rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Note:</strong> Your age is not part of this score. It is only used to check
        that the loan ends before a typical lender age limit.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/rejection" className={primaryBtn}>
          See rejection check
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/dashboard" className={outlineBtn}>
          Edit details
        </Link>
      </div>
    </div>
  )
}
