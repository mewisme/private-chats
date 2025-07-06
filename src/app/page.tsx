'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { findOrCreateRoom } from '@/lib/room'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function FindStranger() {
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { clientId, setRoomId } = useCacheStore()

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

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 mt-10 lg:mt-0">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-black dark:bg-white">
              <MessageCircle className="w-8 h-8 text-white dark:text-black" />
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
              <h3 className="font-semibold text-black dark:text-white mb-3 text-sm">How it works:</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Click "Find Stranger" to search for someone to chat with</li>
                <li>• If someone is waiting, you'll join their room instantly</li>
                <li>• Otherwise, you'll wait for someone to find you</li>
                <li>• Your conversation is completely anonymous</li>
              </ul>
            </CardContent>
          </Card>

          <Button
            onClick={handleFindStranger}
            disabled={isSearching}
            className="w-full"
            size="lg"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-black border-t-transparent mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Find Stranger
              </>
            )}
          </Button>

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