import type { Metadata } from 'next'
import { ScoreView } from '@/components/dashboard/score-view'

export const metadata: Metadata = { title: 'Credit Score' }

export default function Page() {
  return <ScoreView />
}
