import * as React from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { cn } from '@/utils'

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  minRows?: number
  maxRows?: number
  style?: React.CSSProperties
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, minRows = 1, maxRows = 6, style, ...props }, ref) => {
    return (
      <TextareaAutosize
        ref={ref}
        minRows={minRows}
        maxRows={maxRows}
        style={style as any}
        className={cn(
          'flex field-sizing-content min-h-10 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
          'border-input placeholder:text-muted-foreground',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          'dark:bg-input/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none',
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
