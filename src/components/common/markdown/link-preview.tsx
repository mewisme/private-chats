'use client'

import { LinkPreview as LinkPreviewComponent } from '@/components/ui/link-preview'
import { appendUTMParams } from '@/utils'

const utmParams = {
  utm_source: 'chat.mewis.me',
  utm_medium: 'message',
  utm_campaign: 'private-chat'
}

export interface LinkPreviewProps {
  link: string
  text: any
}

export function LinkPreview({ link, text }: LinkPreviewProps) {
  const url = appendUTMParams(link, utmParams)

  return (
    <LinkPreviewComponent
      url={url}
      className="bg-black font-bold text-white dark:bg-gray-100 dark:text-black"
    >
      {text}
    </LinkPreviewComponent>
  )
}
