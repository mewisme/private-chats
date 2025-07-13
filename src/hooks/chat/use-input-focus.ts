'use client'

import { useEffect, useRef } from 'react'

import { Logger } from '@/utils/logger'

export function useInputFocus(isConnected: boolean) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isConnected && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          if (document.activeElement === document.body) {
            inputRef.current?.focus()
          }
        } catch (error) {
          Logger.warn('Auto-focus failed (mobile restriction):', error)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isConnected])

  const focusInput = () => {
    setTimeout(() => {
      try {
        inputRef.current?.focus()
      } catch (error) {
        Logger.warn('Focus restore failed (mobile restriction):', error)
      }
    }, 50)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return {
    inputRef,
    messagesEndRef,
    focusInput,
    scrollToBottom
  }
}
