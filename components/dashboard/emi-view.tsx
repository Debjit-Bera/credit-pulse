'use client'

import { useState } from 'react'
import { useFinance } from '@/components/finance-provider'
import { DEFAULT_RATE, calcEmi, fmt, schedule } from '@/lib/finance'
import { cn } from '@/lib/utils'
import { DonutChart } from './charts'
import { Card, Disclaimer, Loading, PageHeader, Stat, outlineBtn } from './ui'

const inputCls =
  'w-full rounded-xl border border-input bg-card px-3.5 py-3 font-mono text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/15'

function Calculator() {
  const { profile, rate, setRate } = useFinance()
  const [amount, setAmount] = useState(profile ? String(profile.loan) : '100000')
  const [months, setMonths] = useState(profile ? String(profile.tenure) : '12')

  const P = Number(amount)
  const N = Number(months)
  const valid = P >= 1000 && P <= 100000000 && Number.isInteger(N) && N >= 1 && N <= 360
  const emi = valid ? calcEmi(P, rate, N) : 0
  const total = emi * N
  const interest = total - P
  const rows = valid ? schedule(P, rate, N, 6) : []

  const setRateSafe = (v: string) => {
    if (v === '') return setRate(0)
    const n = Number(v)
    if (!isNaN(n)) setRate(Math.min(40, Math.max(0, n)))
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="font-bold text-foreground">Loan inputs</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground" htmlFor="amt">Loan amount (₹)</label>
            <input id="amt" type="number" inputMode="numeric" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground" htmlFor="mon">Duration (months)</label>
            <input id="mon" type="number" inputMode="numeric" className={inputCls} value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="rate">Interest rate (% per year)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="40"
                className={cn(inputCls, 'w-20 py-1.5 text-center')}
                value={rate}
                onChange={(e) => setRateSafe(e.target.value)}
                aria-label="Interest rate value"
              />
            </div>
            <input
              id="rate"
              type="range"
              min="1"
              max="36"
              step="0.5"
              value={rate}
              onChange={(e) => setRateSafe(e.target.value)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between font-mono text-xs text-muted-foreground">
              <span>1%</span>
              <span>36%</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={cn(outlineBtn, 'h-9 px-3 text-xs')} onClick={() => setRate(DEFAULT_RATE)}>
              Reset rate to {DEFAULT_RATE}%
            </button>
            {profile && (
              <button
                type="button"
                className={cn(outlineBtn, 'h-9 px-3 text-xs')}
                onClick={() => {
                  setAmount(String(profile.loan))
                  setMonths(String(profile.tenure))
                }}
              >
                Use my loan details
              </button>
            )}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The rate you set here is also used for your score and loan comparisons.
          </p>
          {!valid && (
            <p role="alert" className="text-sm font-medium text-danger">
              Enter an amount of at least ₹1,000 and a duration of 1–360 whole months.
            </p>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <h2 className="mb-4 font-bold text-foreground">Results</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Monthly EMI" value={fmt(emi)} />
            <Stat label="Total interest" value={fmt(valid ? interest : 0)} />
            <Stat label="Total repayment" value={fmt(total)} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
            <DonutChart
              parts={[
                { label: 'Principal', value: valid ? P : 0, color: 'var(--primary)' },
                { label: 'Interest', value: valid ? Math.max(0, interest) : 0, color: 'var(--accent)' },
              ]}
            />
            <div className="flex flex-col gap-3 text-sm">
              <p className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-primary" aria-hidden="true" /> Principal:{' '}
                <strong className="font-mono">{fmt(valid ? P : 0)}</strong>
              </p>
              <p className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-accent" aria-hidden="true" /> Interest:{' '}
                <strong className="font-mono">{fmt(valid ? interest : 0)}</strong>
              </p>
              {valid && total > 0 && (
                <p className="text-xs text-muted-foreground">
                  Interest is {((interest / total) * 100).toFixed(0)}% of everything you repay.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {rows.length > 0 && (
        <Card className="mt-6 overflow-x-auto">
          <h2 className="mb-3 font-bold text-foreground">First {rows.length} months of repayment</h2>
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 font-semibold">Month</th>
                <th className="font-semibold">Principal paid</th>
                <th className="font-semibold">Interest paid</th>
                <th className="font-semibold">Balance left</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {rows.map((r) => (
                <tr key={r.month} className="border-b border-border/60">
                  <td className="py-2.5">{r.month}</td>
                  <td>{fmt(r.principalPart)}</td>
                  <td>{fmt(r.interest)}</td>
                  <td>{fmt(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  )
}

export function EmiView() {
  const { ready } = useFinance()
  return (
    <div>
      <PageHeader
        eyebrow="EMI calculator"
        title="Calculate your monthly EMI"
        subtitle="Monthly EMI, total interest and total repayment. Adjust the interest rate to compare offers."
      />
      <Disclaimer />
      {ready ? <Calculator /> : <Loading />}
    </div>
  )
}
