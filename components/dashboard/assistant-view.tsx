'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { SendHorizontal } from 'lucide-react'
import { useFinance } from '@/components/finance-provider'
import { SUGGESTIONS, getReply } from '@/lib/assistant'
import { cn } from '@/lib/utils'
import { Card, EmptyState, Loading, PageHeader, primaryBtn } from './ui'

export function AssistantView() {
  const { ready, profile, rate, chat, setChat } = useFinance()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [chat, typing])

  if (!ready) return <Loading />
  if (!profile) return <EmptyState />

  const ask = (text: string) => {
    const q = text.trim()
    if (!q || typing) return
    setChat((c) => [...c, { from: 'user', text: q }])
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      setChat((c) => [...c, { from: 'bot', text: getReply(q, profile, rate) }])
      setTyping(false)
    }, 450)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Assistant"
        title="Ask about your loan"
        subtitle="Instant answers about your score, EMI and options, based on the details you entered."
      />

      <Card className="flex flex-col gap-4 p-0 sm:p-0">
        <div className="flex h-[28rem] flex-col gap-3 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {chat.map((m, i) => (
            <div key={i} className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}>
              <p
                className={cn(
                  'max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  m.from === 'user'
                    ? 'rounded-br-md bg-primary text-primary-foreground'
                    : 'rounded-bl-md bg-muted text-foreground',
                )}
              >
                {m.text}
              </p>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <p className="rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm text-muted-foreground">Thinking…</p>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-4 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={typing}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Your question
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a question…"
              className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
            <button type="submit" className={primaryBtn} disabled={typing || !input.trim()}>
              <SendHorizontal className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Send</span>
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
