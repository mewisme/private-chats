'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle
} from '@/components/animate-ui/headless/dialog'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Logger } from '@/utils/logger'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Logger.error('Error caught by boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleRefresh = () => {
    resetError()
    setIsOpen(false)
    router.refresh()
  }

  const handleGoHome = () => {
    resetError()
    setIsOpen(false)
    router.push('/')
  }

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <DialogBackdrop />
      <DialogPanel>
        <DialogHeader>
          <DialogTitle>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            Something went wrong
          </DialogTitle>
          <DialogDescription>
            We encountered an error while loading this page. This might be a temporary issue.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <details className="text-sm text-gray-600 dark:text-gray-400">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 max-h-32 overflow-auto rounded border p-2 text-xs">
              {error.message || 'Unknown error'}
            </pre>
          </details>
        )}
        <DialogFooter>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={handleGoHome}>
            Go Home
          </Button>
        </DialogFooter>
      </DialogPanel>
    </Dialog>
  )
}
