'use client'

import { BotMessageSquare, MessageCircle, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Loading } from '@/components/common/loading'
import { Logger } from '@/utils/logger'
import { findOrCreateRoom } from '@/lib/room'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useIsClient } from '@/hooks/use-client'
import { useRouteSync } from '@/hooks/use-multi-tab-sync'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/hooks/use-settings'

export default function FindStranger() {
  const isClient = useIsClient()
  const [isSearching, setIsSearching] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { clientId, setRoomId, initializeClientId } = useCacheStore()
  const { settings } = useSettings()
  const { navigateAndSync } = useRouteSync()

  useEffect(() => {
    try {
      initializeClientId()
      setIsInitialized(true)
    } catch (error) {
      Logger.error('Failed to initialize client ID:', error)
      setError('Failed to initialize client session')
    }
  }, [initializeClientId])

  if (!isClient) {
    return <Loading />
  }

  const handleFindStranger = async () => {
    setIsSearching(true)

    try {
      if (!clientId) {
        toast.error('Failed to find a chat room. Please refresh the page and try again.')
        throw new Error('Client ID is not set')
      }
      const roomId = await findOrCreateRoom(clientId)
      setRoomId(roomId)
      toast.success('Connecting to chat room...')
      navigateAndSync(`/chat/${roomId}`)
    } catch (error) {
      Logger.error('Error finding a chat room', error)
      toast.error('Failed to find a chat room. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleWithAI = async () => {
    toast.success('Starting chat with AI...')
    navigateAndSync('/chat/ai')
  }

  if (!isInitialized) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="mt-10 flex min-h-dvh items-center justify-center p-4 lg:mt-0">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-lg font-semibold text-red-600">Initialization Error</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-10 flex min-h-dvh items-center justify-center p-4 lg:mt-0">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-black p-4 dark:bg-white">
              <MessageCircle className="h-8 w-8 text-white dark:text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl">Anonymous Chat</CardTitle>
          <CardDescription>
            Connect with a random stranger for an anonymous conversation
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-black dark:text-white">
                How it works:
              </h3>
              {settings.aiMode ? (
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Click "Chat with AI" to start a conversation with our AI assistant</li>
                  <li>• Ask questions, get help, or have a casual conversation</li>
                  <li>• The AI responds instantly and can help with various topics</li>
                  <li>• Your conversation history is private and secure</li>
                </ul>
              ) : (
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Click "Find Stranger" to search for someone to chat with</li>
                  <li>• If someone is waiting, you'll join their room instantly</li>
                  <li>• Otherwise, you'll wait for someone to find you</li>
                  <li>• Your conversation is completely anonymous</li>
                </ul>
              )}
            </CardContent>
          </Card>

          {settings.aiMode ? (
            <Button onClick={handleWithAI} className="w-full" size={'lg'}>
              <BotMessageSquare className="mr-2 size-4" />
              Chat with AI
            </Button>
          ) : (
            <Button
              onClick={handleFindStranger}
              disabled={isSearching}
              className="w-full"
              size="lg"
            >
              {isSearching ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Find Stranger
                </>
              )}
            </Button>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              By using this service, you agree to be respectful and follow community guidelines
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
