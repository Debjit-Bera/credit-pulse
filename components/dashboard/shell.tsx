'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { Menu, RotateCcw, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useFinance } from '@/components/finance-provider'
import { cn } from '@/lib/utils'
import { NAV } from './nav'
import { outlineBtn } from './ui'

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
      {NAV.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
              active
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { reset } = useFinance()
  const [menuOpen, setMenuOpen] = useState(false)
  const current = NAV.find((n) => n.href === pathname)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const handleReset = () => {
    if (window.confirm('Clear all your entered data and start over?')) {
      reset()
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-dvh">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-ink/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar transition-transform lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/" aria-label="CreditPulse home">
            <Logo tone="light" />
          </Link>
          <button
            type="button"
            className="rounded-lg p-1 text-sidebar-foreground lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <SidebarNav pathname={pathname} onNavigate={() => setMenuOpen(false)} />

        <div className="m-4 rounded-xl border border-sidebar-border p-4 text-xs leading-relaxed text-sidebar-foreground">
          <p className="mb-1 font-semibold text-sidebar-accent-foreground">Private by design</p>
          Your details stay in this browser. Nothing is sent to a server.
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <p className="font-semibold text-foreground">{current?.label ?? 'Dashboard'}</p>
          </div>
          <button type="button" className={cn(outlineBtn, 'h-9 px-3')} onClick={handleReset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          {children}
          <footer className="mt-12 border-t border-border pt-4 text-center text-xs leading-relaxed text-muted-foreground">
            CreditPulse provides estimates for planning purposes only. Results are not an official bank or credit-bureau decision.
          </footer>
        </main>
      </div>
    </div>
  )
}
