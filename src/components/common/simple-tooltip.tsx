import { ReactElement } from 'react'

import {
  Tooltip,
  TooltipContent,
  type TooltipProps,
  TooltipProvider,
  TooltipTrigger} from '@/components/animate-ui/components/tooltip'

interface SimpleTooltipProps {
  children: ReactElement;
  message: string;
  side?: TooltipProps['side']
}

export function SimpleTooltip({ children, message, side }: SimpleTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip side={side}>
        <TooltipTrigger>
          {children}
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}