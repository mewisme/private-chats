'use client'

import { Settings2 } from 'lucide-react'
import { useState } from 'react'

import { type Settings } from '@/hooks/use-settings'

import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle
} from '../../animate-ui/headless/dialog'
import { Button } from '../../ui/button'
import { SettingItem } from './setting-item'

interface SettingItem {
  id: keyof Settings
  label: string
}

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const settingsData: SettingItem[] = [
    {
      id: 'allowMarkdown',
      label: 'Allow markdown'
    },
    {
      id: 'linkPreview',
      label: 'Show link preview'
    },
    {
      id: 'aiMode',
      label: 'Enable AI mode'
    }
  ]

  return (
    <>
      <Button size={'icon'} variant={'outline'} onClick={() => setIsOpen(true)}>
        <Settings2 />
      </Button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogBackdrop />
        <DialogPanel className={'max-w-96'}>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your settings and preferences.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {settingsData.map((item) => (
              <SettingItem key={item.id} {...item} />
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogPanel>
      </Dialog>
    </>
  )
}
