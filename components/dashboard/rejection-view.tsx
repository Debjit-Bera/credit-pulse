'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight, CircleCheck, CircleX, Lightbulb } from 'lucide-react'
import { useFinance } from '@/components/finance-provider'
import { getChecks, getVerdict, type CheckStatus, type Tone } from '@/lib/finance'
import { cn } from '@/lib/utils'
import { Badge, Card, Disclaimer, EmptyState, Loading, PageHeader, TONES, outlineBtn, primaryBtn } from './ui'

const STATUS: Record<CheckStatus, { icon: typeof CircleCheck; label: string; tone: Tone }> = {
  pass: { icon: CircleCheck, label: 'Looks fine', tone: 'green' },
  warn: { icon: AlertTriangle, label: 'Needs attention', tone: 'amber' },
  fail: { icon: CircleX, label: 'Likely rejection reason', tone: 'red' },
}
const ORDER: Record<CheckStatus, number> = { fail: 0, warn: 1, pass: 2 }

export function RejectionView() {
  const { ready, analysis: a, profile } = useFinance()
  if (!ready) return <Loading />
  if (!a || !profile) return <EmptyState />

  const checks = getChecks(profile, a).sort((x, y) => ORDER[x.status] - ORDER[y.status])
  const verdict = getVerdict(a, checks)
  const t = TONES[verdict.tone]

  return (
    <div>
      <PageHeader
        eyebrow="Rejection check"
        title="Why might my loan be rejected?"
        subtitle="Seven checks that mirror what a lender looks at before approving a micro-loan."
      />
      <Disclaimer />

      <div className={cn('mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 p-5 sm:p-6', t.border, t.soft)}>
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">Estimated verdict</p>
          <p className={cn('text-2xl font-extrabold', t.text)}>{verdict.label}</p>
          <p className="text-sm text-foreground">{verdict.text}</p>
        </div>
        <div className="flex gap-2 text-center">
          <div className="rounded-xl bg-card px-4 py-2">
            <p className="font-mono text-xl font-semibold text-danger">{verdict.fails}</p>
            <p className="text-xs text-muted-foreground">issues</p>
          </div>
          <div className="rounded-xl bg-card px-4 py-2">
            <p className="font-mono text-xl font-semibold text-warning">{verdict.warns}</p>
            <p className="text-xs text-muted-foreground">warnings</p>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {checks.map((c) => {
          const s = STATUS[c.status]
          const tone = TONES[s.tone]
          const Icon = s.icon
          return (
            <li key={c.id}>
              <Card className="flex gap-4 p-4 sm:p-5">
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', tone.soft, tone.text)}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-foreground">{c.title}</h3>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
                  {c.status !== 'pass' && c.tip && (
                    <p className="mt-1 flex gap-2 rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed text-foreground">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                      {c.tip}
                    </p>
                  )}
                </div>
              </Card>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/improve" className={primaryBtn}>
          How do I improve?
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/dashboard/score" className={outlineBtn}>
          Back to score
        </Link>
      </div>
    </div>
  )
}
