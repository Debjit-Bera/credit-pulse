import type { Metadata } from 'next'
import { EmiView } from '@/components/dashboard/emi-view'

export const metadata: Metadata = { title: 'EMI Calculator' }

export default function Page() {
  return <EmiView />
}
