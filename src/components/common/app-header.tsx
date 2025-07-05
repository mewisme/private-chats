import { Logo } from '../base/logo'
import { ThemeToggle } from '@/components/common/theme-toggle'

export function Header() {
  return (
    <header className='fixed z-40 w-full items-center justify-center flex mb-4'>
      <div className='flex items-center justify-between w-full px-4 py-6 max-w-4xl bg-transparent backdrop-blur-md'>
        <Logo draw isMew />
        <ThemeToggle />
      </div>
    </header>
  )
} 