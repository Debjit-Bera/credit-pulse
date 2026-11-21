import type { Metadata } from 'next'
import { ImproveView } from '@/components/dashboard/improve-view'

export const metadata: Metadata = { title: 'Improve Your Score' }

export default function Page() {
  return <ImproveView />
}
