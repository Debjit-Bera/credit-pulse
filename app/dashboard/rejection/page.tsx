import type { Metadata } from 'next'
import { RejectionView } from '@/components/dashboard/rejection-view'

export const metadata: Metadata = { title: 'Rejection Check' }

export default function Page() {
  return <RejectionView />
}
