import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/lib/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jovin Fluo - Data Analytics Platform',
  description: 'Open-source data analytics and visualization platform. Upload data, create dashboards, and export insights.',
  keywords: ['data analytics', 'data visualization', 'business intelligence', 'dashboard', 'data analysis'],
  authors: [{ name: 'Jovin Fluo Team' }],
  openGraph: {
    title: 'Jovin Fluo - Data Analytics Platform',
    description: 'Open-source data analytics and visualization platform',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jovin Fluo - Data Analytics Platform',
    description: 'Open-source data analytics and visualization platform',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}

