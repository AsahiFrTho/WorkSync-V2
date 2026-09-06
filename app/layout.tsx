import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { SessionProvider } from '@/lib/auth/session-context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'WorkSync — Skilling Outcomes & Impact, Maharashtra',
  description:
    'Longitudinal skilling-outcomes and impact-measurement platform for Maharashtra: training, certification, placement, wage progression, and retention.',
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", sizes: "180x180" }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#1F497D',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
