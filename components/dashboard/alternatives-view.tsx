'use client'

import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { useFinance } from '@/components/finance-provider'
import { buildAlternatives, fmt, pct } from '@/lib/finance'
import { cn } from '@/lib/utils'
import { BarList } from './charts'
import { Badge, Card, Disclaimer, EmptyState, Loading, PageHeader, TONES, primaryBtn } from './ui'

function Delta({ less, amount, label }: { less: boolean; amount: number; label: string }) {
  const Icon = less ? ArrowDown : ArrowUp
  return (
    <span className={cn('inline-flex items-center gap-0.5', less ? 'text-success' : 'text-danger')}>
      {label} <Icon className="size-3" aria-label={less ? 'lower' : 'higher'} /> {fmt(amount)}
    </span>
  )
}

export function AlternativesView() {
  const { ready, profile, rate } = useFinance()
  if (!ready) return <Loading />
  if (!profile) return <EmptyState />

  const { options, maxLoanSame, maxByAge } = buildAlternatives(profile, rate)
  const current = options[0]
  const best = [...options].sort((x, y) => y.a.score - x.a.score || x.a.totalInterest - y.a.totalInterest)[0]

  return (
    <div>
      <PageHeader
        eyebrow="Alternative loans"
        title="Compare safer loan options"
        subtitle="See how changing the amount or tenure affects your EMI, interest and approval chances."
      />
      <Disclaimer />

      <Card className="mb-6 bg-secondary">
        <p className="text-sm leading-relaxed text-secondary-foreground">
          {maxLoanSame >= 1000 ? (
            <>
              Based on your income and existing EMI, you could comfortably borrow up to <strong>{fmt(maxLoanSame)}</strong> over{' '}
              <strong>{profile.tenure} months</strong> while keeping total EMIs at 40% of income.
            </>
          ) : (
            <>Your existing EMIs already use most of the safe 40% limit, so there is little room for a new loan. Reduce existing EMIs first.</>
          )}{' '}
          Tenure options are capped so the loan ends before age 65 (max {maxByAge} months for you).
        </p>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {options.map((o) => {
          const t = TONES[o.verdict.tone]
          const isBest = o.id === best.id && o.id !== 'current'
          return (
            <Card key={o.id} className={cn('relative flex flex-col gap-4', isBest && 'border-success ring-2 ring-success/30')}>
              {isBest && (
                <span className="absolute -top-3 right-4 rounded-full bg-success px-3 py-0.5 text-xs font-bold text-primary-foreground">
                  Best pick
                </span>
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-foreground">{o.name}</h3>
                  <p className="text-xs text-muted-foreground">{o.desc}</p>
                </div>
                <Badge tone={o.a.risk.tone}>{o.a.score}/100</Badge>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Loan amount', fmt(o.loan)],
                  ['Tenure', `${o.tenure} months`],
                  ['Monthly EMI', fmt(o.a.newEmi)],
                  ['Total interest', fmt(o.a.totalInterest)],
                  ['All EMIs / income', pct(o.a.foir)],
                  ['Left each month', fmt(o.a.leftover)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="font-mono font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className={cn('rounded-lg px-3 py-2 text-xs font-semibold', t.soft, t.text)}>
                Estimated verdict: {o.verdict.label}
              </p>

              {o.id !== 'current' && (
                <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  <Delta label="EMI" less={o.a.newEmi <= current.a.newEmi} amount={Math.abs(o.a.newEmi - current.a.newEmi)} />
                  <Delta
                    label="Interest"
                    less={o.a.totalInterest <= current.a.totalInterest}
                    amount={Math.abs(o.a.totalInterest - current.a.totalInterest)}
                  />
                </p>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="mt-6">
        <h2 className="mb-5 font-bold text-foreground">Score comparison</h2>
        <BarList
          items={options.map((o) => ({
            label: o.name,
            value: o.a.score,
            max: 100,
            color: TONES[o.a.risk.tone].stroke,
            text: `${o.a.score}/100 · EMI ${fmt(o.a.newEmi)}`,
          }))}
        />
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Trade-off: a longer tenure lowers the EMI but increases the total interest you pay. A smaller loan lowers both.
        </p>
      </Card>

      <div className="mt-6">
        <Link href="/dashboard/emi" className={primaryBtn}>
          Open EMI calculator
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
