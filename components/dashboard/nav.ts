import { Activity, ArrowLeftRight, MessageSquare, Percent, ShieldAlert, TrendingUp, UserRound, type LucideIcon } from 'lucide-react'

export type NavItem = { href: string; label: string; icon: LucideIcon }

export const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Your Details', icon: UserRound },
  { href: '/dashboard/score', label: 'Credit Score', icon: Activity },
  { href: '/dashboard/rejection', label: 'Rejection Check', icon: ShieldAlert },
  { href: '/dashboard/improve', label: 'Improve Your Score', icon: TrendingUp },
  { href: '/dashboard/assistant', label: 'Assistant', icon: MessageSquare },
  { href: '/dashboard/alternatives', label: 'Alternative Loans', icon: ArrowLeftRight },
  { href: '/dashboard/emi', label: 'EMI Calculator', icon: Percent },
]
