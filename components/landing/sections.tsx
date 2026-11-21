import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NAV } from '@/components/dashboard/nav'
import { primaryBtn } from '@/components/dashboard/ui'

const FEATURE_COPY: Record<string, string> = {
  '/dashboard/score': 'A score out of 100 from five money ratios, with a clear breakdown of every point.',
  '/dashboard/rejection': 'Seven lender-style checks that flag exactly what could get your application declined.',
  '/dashboard/improve': 'Personal tips and a 3-month roadmap showing how far your score can climb.',
  '/dashboard/assistant': 'Ask plain questions about your EMI, affordability or options and get instant answers.',
  '/dashboard/alternatives': 'Compare smaller amounts and longer tenures side by side to find the safest fit.',
  '/dashboard/emi': 'Monthly EMI, total interest and a repayment schedule at any interest rate.',
}

export function Features() {
  const items = NAV.filter((n) => FEATURE_COPY[n.href])
  return (
    <section id="features" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <div className="mb-12 flex max-w-2xl flex-col gap-3">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground">
            Everything you need to borrow with confidence
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Enter your numbers once. Every tool below uses them to give you a consistent, personal picture.
          </p>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => {
            const Icon = f.icon
            return (
              <li key={f.href} className="bg-card">
                <Link href={f.href} className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-muted">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <h3 className="font-bold text-foreground">{f.label}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{FEATURE_COPY[f.href]}</p>
                  <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-primary">
                    Open
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

const STEPS = [
  { title: 'Share six numbers', text: 'Age, monthly income, expenses, existing EMI, loan amount and tenure.' },
  { title: 'Get your score', text: 'See your score, risk level and the exact ratios behind it in seconds.' },
  { title: 'Fix and compare', text: 'Follow the roadmap and compare safer options before you apply.' },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
      <h2 className="mb-10 text-balance text-3xl font-extrabold tracking-tight text-foreground">How it works</h2>
      <ol className="grid gap-8 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-2 border-t-2 border-primary pt-5">
            <span className="font-mono text-sm font-medium text-primary">Step {i + 1}</span>
            <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
            <p className="leading-relaxed text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
      <div className="flex flex-col items-start gap-6 rounded-3xl bg-ink p-8 text-ink-foreground sm:p-12 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
            Two minutes now can save you a rejection later.
          </h2>
          <p className="leading-relaxed">Free to use, no account needed and nothing stored on our servers.</p>
        </div>
        <Link href="/dashboard" className={`${primaryBtn} bg-accent text-accent-foreground hover:bg-accent/90`}>
          Start my check
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} CreditPulse</p>
        <p className="max-w-xl leading-relaxed">
          Results are estimates for planning only and are not an official bank or credit-bureau decision.
        </p>
      </div>
    </footer>
  )
}
