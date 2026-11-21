'use client'

import Link from 'next/link'
import { ArrowRight, Check, Lightbulb, PartyPopper } from 'lucide-react'
import { useFinance } from '@/components/finance-provider'
import { buildRoadmap, getChecks, getRisk } from '@/lib/finance'
import { BarList } from './charts'
import { Badge, Card, Disclaimer, EmptyState, Loading, PageHeader, TONES, outlineBtn, primaryBtn } from './ui'

const GENERAL_TIPS = [
  'Pay every EMI and bill before the due date – payment history is the biggest real-world factor.',
  'Keep credit-card use below 30% of your limit.',
  'Avoid applying to many lenders in a short time.',
  'Build an emergency fund worth 3 months of expenses.',
]

export function ImproveView() {
  const { ready, analysis: a, profile, rate } = useFinance()
  if (!ready) return <Loading />
  if (!a || !profile) return <EmptyState />

  const problems = getChecks(profile, a).filter((c) => c.status !== 'pass' && c.tip)
  const road = buildRoadmap(profile, rate)
  const bars = [
    { label: 'Today', score: a.score },
    ...road.steps.map((s) => ({ label: `After month ${s.month}`, score: s.result.score })),
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Improve your score"
        title="Your personal improvement plan"
        subtitle="Targeted tips and a 3-month roadmap based on your own numbers."
      />
      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold text-foreground">Personalised tips</h2>
          {problems.length === 0 ? (
            <p className="flex gap-2 rounded-xl bg-success-soft p-4 text-sm leading-relaxed text-success">
              <PartyPopper className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              No weak spots found. Keep your habits steady and avoid new debt.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {problems.map((c) => (
                <li key={c.id} className="flex flex-col gap-1 rounded-xl bg-muted p-3 text-sm">
                  <p className="font-semibold text-foreground">{c.title}</p>
                  <p className="flex gap-2 leading-relaxed text-muted-foreground">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                    {c.tip}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mb-2 mt-6 text-sm font-bold text-foreground">Good habits for everyone</h3>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
            {GENERAL_TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-bold text-foreground">Projected score</h2>
          <p className="mb-5 text-sm text-muted-foreground">{"If you complete each month's plan."}</p>
          <BarList
            items={bars.map((b) => ({
              label: b.label,
              value: b.score,
              max: 100,
              color: TONES[getRisk(b.score).tone].stroke,
              text: `${b.score}/100`,
            }))}
          />
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Assumes expenses fall by 10–15%, existing EMI falls by about 20% and the loan request is trimmed by 15%.
          </p>
        </Card>
      </div>

      <h2 className="mb-4 mt-10 text-lg font-bold text-foreground">Your 3-month roadmap</h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {road.steps.map((s) => (
          <li key={s.month}>
            <Card className="h-full">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Month {s.month}</span>
                <Badge tone={s.result.risk.tone}>Score {s.result.score}</Badge>
              </div>
              <h3 className="font-bold text-foreground">{s.title}</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                {s.actions.map((act) => (
                  <li key={act} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/assistant" className={primaryBtn}>
          Ask the assistant
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/dashboard/rejection" className={outlineBtn}>
          Back
        </Link>
      </div>
    </div>
  )
}
