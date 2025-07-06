'use client'

import { BotMessageSquare, MessageCircle, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { findOrCreateRoom } from '@/lib/room'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/hooks/use-settings'
import { useState } from 'react'

export default function FindStranger() {
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { clientId, setRoomId } = useCacheStore()
  const { settings } = useSettings()

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
      router.push(`/chat/${roomId}`)
    } catch (error) {
      toast.error('Failed to find a chat room. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleWithAI = async () => {
    toast.success('Starting chat with AI...')
    router.push(`/chat/ai`)
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
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li>• Click "Find Stranger" to search for someone to chat with</li>
                <li>• If someone is waiting, you'll join their room instantly</li>
                <li>• Otherwise, you'll wait for someone to find you</li>
                <li>• Your conversation is completely anonymous</li>
              </ul>
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
