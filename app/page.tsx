import Link from 'next/link'
import { Logo } from '@/components/logo'
import { primaryBtn } from '@/components/dashboard/ui'
import { Hero } from '@/components/landing/hero'
import { Cta, Features, HowItWorks, SiteFooter } from '@/components/landing/sections'

export default function HomePage() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" aria-label="CreditPulse home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-6 text-sm font-medium">
          <a href="#features" className="hidden text-muted-foreground hover:text-foreground sm:inline">Features</a>
          <a href="#how" className="hidden text-muted-foreground hover:text-foreground sm:inline">How it works</a>
          <Link href="/dashboard" className={`${primaryBtn} h-10`}>Open app</Link>
        </nav>
      </header>
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Cta />
      </main>
      <SiteFooter />
    </>
  )
}
