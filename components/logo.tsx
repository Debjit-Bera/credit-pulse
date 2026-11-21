import { cn } from '@/lib/utils'

export function Logo({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-xl',
          tone === 'dark' ? 'bg-ink' : 'bg-sidebar-accent',
        )}
      >
        <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
          <polyline
            points="4 17 10 17 13 9 18 24 21 17 28 17"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          'text-lg font-extrabold tracking-tight',
          tone === 'dark' ? 'text-foreground' : 'text-sidebar-accent-foreground',
        )}
      >
        CreditPulse
      </span>
    </span>
  )
}
