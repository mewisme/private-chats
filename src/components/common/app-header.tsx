import { Github } from 'lucide-react'
import Link from 'next/link'

import { ThemeToggle } from '@/components/common/theme-toggle'

import { Logo } from '../base/logo'
import { Button } from '../ui/button'
import { SettingsDialog } from './settings/settings-dialog'

export function Header() {
  return (
    <header
      className="fixed top-0 right-0 left-0 z-40 flex w-full items-center justify-center"
      style={{ paddingTop: 'var(--safe-area-inset-top)' }}
    >
      <div className="flex w-full max-w-4xl items-center justify-between px-4 py-2 backdrop-blur-xl">
        <Link href="/">
          <Logo draw isMew />
        </Link>
        <div className="space-x-2">
          <SettingsDialog />
          <ThemeToggle />
          <Link href={'https://github.com/mewisme/private-chats'} target="_blank">
            <Button variant={'outline'} size={'icon'}>
              <Github />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
