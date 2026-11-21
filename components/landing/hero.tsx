import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { outlineBtn, primaryBtn } from '@/components/dashboard/ui'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-8 lg:grid-cols-2 lg:pt-16">
      <div className="flex flex-col gap-6">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Micro-loan readiness check</p>
        <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
          Know your loan chances before the bank does.
        </h1>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
          CreditPulse turns your income, expenses and existing EMIs into a clear score out of 100, explains exactly why a
          loan might be declined, and shows you how to fix it.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className={primaryBtn}>
            Check my score
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/dashboard/emi" className={outlineBtn}>
            EMI calculator
          </Link>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" aria-hidden="true" />
          Free, no sign-up. Your details never leave your browser.
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-3xl border border-border">
          <Image
            src="/images/hero.png"
            alt="A shop owner reviewing her ledger and monthly budget at her counter"
            width={1024}
            height={1024}
            priority
            className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
          />
        </div>
        <ScoreCard />
      </div>
    </section>
  )
}

function ScoreCard() {
  return (
    <div className="absolute -bottom-8 left-4 right-4 rounded-2xl bg-ink p-5 text-ink-foreground shadow-xl sm:left-auto sm:w-80">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">CreditPulse score</p>
        <p className="font-mono text-3xl font-semibold text-accent">
          78<span className="text-base text-ink-foreground">/100</span>
        </p>
      </div>
      <svg viewBox="0 0 300 60" className="mt-3 w-full" aria-hidden="true">
        <polyline
          points="0 40 60 40 80 38 100 12 120 52 140 30 160 34 300 34"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="animate-pulse-trace"
        />
      </svg>
      <p className="mt-2 text-xs">Low risk · Likely approved</p>
    </div>
  )
}
