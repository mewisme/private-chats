'use client'

import { LogOut } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { useCacheStore } from '@/hooks/use-cache-store'
import { useIsClient } from '@/hooks/use-client'
import { useSettings } from '@/hooks/use-settings'
import { leaveRoom } from '@/lib/room'

import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle
} from '../animate-ui/headless/dialog'
import { SimpleTooltip } from '../common/simple-tooltip'
import { Button } from '../ui/button'

interface ChatLeaveButtonProps {
  onLeave?: () => void
  onLeaveAI?: () => void
}

export function ChatLeaveButton({ onLeaveAI, onLeave }: ChatLeaveButtonProps) {
  const isClient = useIsClient()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { clientId, roomId, clearCache } = useCacheStore()
  const { settings, updateSetting } = useSettings()

  if (!isClient) {
    return null
  }

  const isChatPage = pathname.startsWith('/chat')

  const handleLeaveChat = async () => {
    if (!roomId || !clientId) {
      toast.error('You are not in a chat')
      return
    }

    await leaveRoom(roomId, clientId)
    clearCache()
  }

  const handleLeaveChatAI = async () => {
    updateSetting('aiMode', false)
    toast.success('AI mode disabled')
  }

  const handleLeave = async () => {
    try {
      if (settings.aiMode) {
        await handleLeaveChatAI()
      } else {
        await handleLeaveChat()
      }
    } finally {
      setIsOpen(false)
      router.push('/')
      onLeave?.()
      onLeaveAI?.()
      router.push('/')
    }
  }

  return (
    <>
      {((roomId && isChatPage) || settings.aiMode) && (
        <SimpleTooltip message="Leave Chat">
          <Button onClick={() => setIsOpen(true)} variant="destructive" size="icon">
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </SimpleTooltip>
      )}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogBackdrop />
        <DialogPanel>
          <DialogHeader>
            <DialogTitle>Leave chat</DialogTitle>
            <DialogDescription>Are you sure you want to leave this chat?</DialogDescription>
          </DialogHeader>
          <p>All messages will be deleted and you will be disconnected from the chat.</p>
          <DialogFooter>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant={'destructive'} onClick={handleLeave}>
                Leave
              </Button>
            </DialogFooter>
          </DialogFooter>
        </DialogPanel>
      </Dialog>
    </>
  )
}
