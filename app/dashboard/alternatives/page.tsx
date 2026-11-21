import type { Metadata } from 'next'
import { AlternativesView } from '@/components/dashboard/alternatives-view'

export const metadata: Metadata = { title: 'Alternative Loans' }

export default function Page() {
  return <AlternativesView />
}
