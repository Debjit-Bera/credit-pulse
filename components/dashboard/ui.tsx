import Link from 'next/link'
import type { ReactNode } from 'react'
import { Info, UserRound } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/finance'

export const TONES: Record<Tone, { soft: string; text: string; border: string; fill: string; stroke: string }> = {
  green: { soft: 'bg-success-soft', text: 'text-success', border: 'border-success/30', fill: 'bg-success', stroke: 'var(--success)' },
  amber: { soft: 'bg-warning-soft', text: 'text-warning', border: 'border-warning/30', fill: 'bg-warning', stroke: 'var(--warning)' },
  orange: { soft: 'bg-caution-soft', text: 'text-caution', border: 'border-caution/30', fill: 'bg-caution', stroke: 'var(--caution)' },
  red: { soft: 'bg-danger-soft', text: 'text-danger', border: 'border-danger/30', fill: 'bg-danger', stroke: 'var(--danger)' },
}

export const primaryBtn = cn(buttonVariants(), 'h-11 gap-2 rounded-xl px-5 text-sm font-semibold')
export const outlineBtn = cn(buttonVariants({ variant: 'outline' }), 'h-11 gap-2 rounded-xl px-5 text-sm font-semibold')

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-2xl border border-border bg-card p-5 sm:p-6', className)}>{children}</div>
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const t = TONES[tone]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold', t.soft, t.text, t.border)}>
      {children}
    </span>
  )
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      {eyebrow && <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary">{eyebrow}</p>}
      <h1 className="text-balance text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      {subtitle && <p className="text-pretty leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

export function Disclaimer() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        <strong>Estimate only.</strong> Scores and predictions are calculated from the details you enter using
        transparent rules. They are not an official bank or credit-bureau decision.
      </p>
    </div>
  )
}

export function EmptyState() {
  return (
    <Card className="mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <UserRound className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold">Enter your details first</h2>
      <p className="leading-relaxed text-muted-foreground">
        CreditPulse needs your income, expenses and loan request once. After that, every tool reuses them.
      </p>
      <Link href="/dashboard" className={cn(primaryBtn, 'mt-2')}>
        Go to Your Details
      </Link>
    </Card>
  )
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono text-xl font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="h-48 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}
