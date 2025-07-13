'use client'

import ReactMarkdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'

import { useSettings } from '@/hooks/use-settings'
import { autoLinkifyText } from '@/utils'

import { LinkPreview } from './link-preview'

export function Markdown(props: React.ComponentProps<typeof ReactMarkdown>) {
  const { settings } = useSettings()

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        [rehypeExternalLinks, { target: '_blank', rel: 'nofollow noopener noreferrer' }]
      ]}
      components={{
        a: settings.linkPreview
          ? ({ href, children }) => {
              if (!href || !children) return null
              return <LinkPreview link={href} text={children} />
            }
          : undefined
      }}
      {...props}
    >
      {autoLinkifyText(props.children ?? '')}
    </ReactMarkdown>
  )
}
