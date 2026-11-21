'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useFinance } from '@/components/finance-provider'
import type { FormErrors, FormValues } from '@/lib/finance'
import { cn } from '@/lib/utils'
import { Card, Loading, PageHeader, outlineBtn, primaryBtn } from './ui'

const FIELDS: { name: keyof FormValues; label: string; hint: string; prefix?: string; suffix?: string }[] = [
  { name: 'age', label: 'Age', hint: '18 to 80 years', suffix: 'yrs' },
  { name: 'income', label: 'Monthly income', hint: 'Take-home pay per month', prefix: '₹' },
  { name: 'expenses', label: 'Monthly expenses', hint: 'Rent, food, bills, travel', prefix: '₹' },
  { name: 'emi', label: 'Existing EMI', hint: 'Enter 0 if you have no loans', prefix: '₹' },
  { name: 'loan', label: 'Loan amount needed', hint: '₹1,000 to ₹10,00,000', prefix: '₹' },
  { name: 'tenure', label: 'Loan duration', hint: '3 to 120 months', suffix: 'months' },
]

export function DetailsView() {
  const router = useRouter()
  const { ready, form, updateField, saveProfile, loadSample, profile } = useFinance()
  const [errors, setErrors] = useState<FormErrors>({})

  if (!ready) return <Loading />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = saveProfile()
    setErrors(errs)
    if (Object.keys(errs).length === 0) router.push('/dashboard/score')
  }

  const onSample = (kind: 'needsWork' | 'strong') => {
    loadSample(kind)
    setErrors({})
    router.push('/dashboard/score')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Start here"
        title="Tell us about your finances"
        subtitle="Enter these once. Your score, rejection check, roadmap and loan comparisons all update from them."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((f) => {
                const err = errors[f.name]
                const id = `field-${f.name}`
                return (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label htmlFor={id} className="text-sm font-semibold text-foreground">
                      {f.label}
                    </label>
                    <div
                      className={cn(
                        'flex items-center rounded-xl border bg-card transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15',
                        err ? 'border-danger' : 'border-input',
                      )}
                    >
                      {f.prefix && <span className="pl-3.5 font-mono text-muted-foreground">{f.prefix}</span>}
                      <input
                        id={id}
                        name={f.name}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={form[f.name]}
                        onChange={(e) => updateField(f.name, e.target.value)}
                        aria-invalid={Boolean(err)}
                        aria-describedby={`${id}-hint`}
                        className="w-full bg-transparent px-3.5 py-3 font-mono text-foreground outline-none placeholder:text-muted-foreground"
                        placeholder="0"
                      />
                      {f.suffix && <span className="pr-3.5 text-sm text-muted-foreground">{f.suffix}</span>}
                    </div>
                    <p id={`${id}-hint`} className={cn('text-xs', err ? 'font-medium text-danger' : 'text-muted-foreground')}>
                      {err ?? f.hint}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <button type="submit" className={primaryBtn}>
                {profile ? 'Update & view score' : 'Check my score'}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              {Object.keys(errors).length > 0 && (
                <p role="alert" className="text-sm font-medium text-danger">
                  Please fix the highlighted fields.
                </p>
              )}
            </div>
          </form>
        </Card>

        <Card className="flex h-fit flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <h2 className="font-bold text-foreground">Try a sample profile</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Not ready to enter your own numbers? Explore CreditPulse with one of these example profiles.
          </p>
          <div className="flex flex-col gap-2">
            <button type="button" className={cn(outlineBtn, 'w-full justify-between')} onClick={() => onSample('needsWork')}>
              Profile that needs work
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <button type="button" className={cn(outlineBtn, 'w-full justify-between')} onClick={() => onSample('strong')}>
              Strong profile
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your data stays in your browser and is never sent to any server.
          </p>
        </Card>
      </div>
    </div>
  )
}
