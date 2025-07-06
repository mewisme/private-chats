'use client'

import { Dialog, DialogBackdrop, DialogDescription, DialogFooter, DialogHeader, DialogPanel, DialogTitle } from '../animate-ui/headless/dialog'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '../ui/button'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { Logo } from '../base/logo'
import { SimpleTooltip } from './simple-tooltip'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { leaveRoom } from '@/lib/room'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'

export function Header() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { clientId, roomId, clearCache } = useCacheStore()
  const pathname = usePathname()
  const isChatPage = pathname.startsWith('/chat')

  useEffect(() => {
    console.log('Header - roomId changed:', roomId)
  }, [roomId])

  const handleLeaveChat = async () => {
    if (!roomId || !clientId) {
      toast.error('You are not in a chat');
      return;
    }

    try {
      console.log('Header - Manual leave, roomId:', roomId, 'clientId:', clientId);
      await leaveRoom(roomId, clientId);
      clearCache();
      router.push('/');
      setIsOpen(false);
    } catch {
      toast.error('Failed to leave chat');
    }
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-40 w-full items-center justify-center flex' style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
      <div className='flex items-center justify-between w-full px-4 py-2 max-w-4xl backdrop-blur-xl'>
        <Link href="/">
          <Logo draw isMew />
        </Link>
        <div className='space-x-2'>
          {roomId && isChatPage && (
            <SimpleTooltip message='Leave Chat'>
              <Button onClick={() => setIsOpen(true)} variant="destructive" size="icon">
                <LogOut className='h-[1.2rem] w-[1.2rem]' />
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
              <p>
                All messages will be deleted and you will be disconnected from the chat.
              </p>
              <DialogFooter>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant={'destructive'} onClick={handleLeaveChat}>
                    Leave
                  </Button>
                </DialogFooter>
              </DialogFooter>
            </DialogPanel>
          </Dialog>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 