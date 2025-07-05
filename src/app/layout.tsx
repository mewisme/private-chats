import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { StarsBackground } from '@/components/animate-ui/backgrounds/stars'
import { Header } from '@/components/common/app-header'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anonymous Chat',
  description: 'Connect with strangers for anonymous conversations',
}

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'relative')}>
        <StarsBackground className="absolute flex items-center justify-center rounded-xl -z-50" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
