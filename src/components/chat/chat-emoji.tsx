'use client'

import * as React from 'react'

import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch
} from '@/components/ui/emoji-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/animate-ui/base/popover'

import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'

interface ChatEmojiProps {
  setEmoji: (emoji: string) => void
}

export function ChatEmoji({ setEmoji }: ChatEmojiProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger
        render={
          <Button size={'icon'} variant={'ghost'}>
            <Smile />
          </Button>
        }
      />
      <PopoverContent className="w-fit p-0">
        <EmojiPicker
          className="h-60 sm:h-96"
          onEmojiSelect={({ emoji }) => {
            setIsOpen(false)
            setEmoji(emoji)
          }}
        >
          <EmojiPickerSearch />
          <EmojiPickerContent />
          <EmojiPickerFooter />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  )
}
