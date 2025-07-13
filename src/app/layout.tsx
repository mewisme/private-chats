import '@/styles/globals.css'

import type { Metadata, Viewport } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { ErrorBoundary } from '@/components/providers/error-boundary'
import { Header } from '@/components/common/app-header'
import { Inter } from 'next/font/google'
import { PageTransition } from '@/components/common/page-transition'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anonymous Chat',
  description: 'Connect with strangers for anonymous conversations',
  metadataBase: new URL('https://chat.mewis.me'),
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png'
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png'
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png'
    }
  ],
  authors: [
    {
      name: 'Mew',
      url: 'https://mewis.me'
    }
  ],
  publisher: 'Anonymous Chat',
  openGraph: {
    title: 'Anonymous Chat',
    description: 'Connect with strangers for anonymous conversations',
    url: 'https://chat.mewis.me',
    siteName: 'Anonymous Chat',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Anonymous Chat'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mewisme',
    title: 'Anonymous Chat',
    description: 'Connect with strangers for anonymous conversations',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Anonymous Chat'
      }
    ]
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover' // This enables safe area insets on iOS
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-dvh')}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <PageTransition className="w-full">
              {children}
            </PageTransition>
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
