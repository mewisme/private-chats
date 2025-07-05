import '@/styles/globals.css'

import type { Metadata, Viewport } from 'next'

import { Header } from '@/components/common/app-header'
import { Inter } from 'next/font/google'
import { StarsBackground } from '@/components/animate-ui/backgrounds/stars'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anonymous Chat',
  description: 'Connect with strangers for anonymous conversations',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // This enables safe area insets on iOS
}

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'relative h-dvh')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StarsBackground className="absolute flex items-center justify-center rounded-xl -z-50 h-full" />
          <Header />
          <div className='h-dvh w-full'>
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
