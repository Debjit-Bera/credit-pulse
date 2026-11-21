import type { Metadata } from 'next'
import { AssistantView } from '@/components/dashboard/assistant-view'

export const metadata: Metadata = { title: 'Assistant' }

export default function Page() {
  return <AssistantView />
}
