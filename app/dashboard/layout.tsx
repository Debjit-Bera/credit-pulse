import type { ReactNode } from 'react'
import { FinanceProvider } from '@/components/finance-provider'
import { DashboardShell } from '@/components/dashboard/shell'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <FinanceProvider>
      <DashboardShell>{children}</DashboardShell>
    </FinanceProvider>
  )
}
