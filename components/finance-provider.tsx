'use client'

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import {
  DEFAULT_RATE,
  analyze,
  toProfile,
  validate,
  type Analysis,
  type FormErrors,
  type FormValues,
  type Profile,
} from '@/lib/finance'
import { WELCOME, type ChatMessage } from '@/lib/assistant'

const STORAGE_KEY = 'creditpulse_v1'

const EMPTY_FORM: FormValues = { age: '', income: '', expenses: '', emi: '', loan: '', tenure: '' }

export const SAMPLES: Record<'needsWork' | 'strong', FormValues> = {
  needsWork: { age: '28', income: '40000', expenses: '24000', emi: '8000', loan: '200000', tenure: '24' },
  strong: { age: '30', income: '85000', expenses: '30000', emi: '5000', loan: '150000', tenure: '24' },
}

type FinanceContextValue = {
  ready: boolean
  form: FormValues
  updateField: (name: keyof FormValues, value: string) => void
  profile: Profile | null
  analysis: Analysis | null
  rate: number
  setRate: (rate: number) => void
  chat: ChatMessage[]
  setChat: Dispatch<SetStateAction<ChatMessage[]>>
  saveProfile: () => FormErrors
  loadSample: (kind: keyof typeof SAMPLES) => void
  reset: () => void
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [form, setForm] = useState<FormValues>(EMPTY_FORM)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [rate, setRate] = useState(DEFAULT_RATE)
  const [chat, setChat] = useState<ChatMessage[]>([WELCOME])

  // Restore saved details after mount so server and client markup match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.form) setForm(saved.form)
        if (saved.profile) setProfile(saved.profile)
        if (typeof saved.rate === 'number') setRate(saved.rate)
      }
    } catch {
      // ignore corrupted storage
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, profile, rate }))
    } catch {
      // ignore storage quota errors
    }
  }, [ready, form, profile, rate])

  const analysis = useMemo(() => (profile ? analyze(profile, rate) : null), [profile, rate])

  const value: FinanceContextValue = {
    ready,
    form,
    updateField: (name, val) => setForm((f) => ({ ...f, [name]: val })),
    profile,
    analysis,
    rate,
    setRate,
    chat,
    setChat,
    saveProfile: () => {
      const errors = validate(form)
      if (Object.keys(errors).length === 0) setProfile(toProfile(form))
      return errors
    },
    loadSample: (kind) => {
      setForm(SAMPLES[kind])
      setProfile(toProfile(SAMPLES[kind]))
      setRate(DEFAULT_RATE)
      setChat([WELCOME])
    },
    reset: () => {
      setForm(EMPTY_FORM)
      setProfile(null)
      setRate(DEFAULT_RATE)
      setChat([WELCOME])
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    },
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider')
  return ctx
}
