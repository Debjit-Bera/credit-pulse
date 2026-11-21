import type { Metadata } from 'next'
import { DetailsView } from '@/components/dashboard/details-view'

export const metadata: Metadata = { title: 'Your Details' }

export default function Page() {
  return <DetailsView />
}
