import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CreditPulse – Micro-Loan Eligibility & Risk Checker',
    template: '%s · CreditPulse',
  },
  description:
    'Check your micro-loan readiness in seconds. Get a credit score out of 100, see why a loan might be rejected, compare safer alternatives and calculate your EMI.',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1d2a3a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${plexMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
