'use client'

import {
  CloseButton,
  Description as DialogDescriptionPrimitive,
  Dialog as DialogPrimitive,
  DialogBackdrop as DialogBackdropPrimitive,
  type DialogBackdropProps as DialogBackdropPrimitiveProps,
  DialogPanel as DialogPanelPrimitive,
  type DialogPanelProps as DialogPanelPrimitiveProps,
  type DialogProps as DialogPrimitiveProps,
  DialogTitle as DialogTitlePrimitive,
  type DialogTitleProps as DialogTitlePrimitiveProps,
} from '@headlessui/react'
import { X } from 'lucide-react'
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type Transition,
} from 'motion/react'
import * as React from 'react'

import { cn } from '@/utils/index'

type DialogProps<TTag extends React.ElementType = 'div'> = Omit<
  DialogPrimitiveProps<TTag>,
  'static'
> & {
  className?: string;
  as?: TTag;
};

function Dialog<TTag extends React.ElementType = 'div'>({
  className,
  ...props
}: DialogProps<TTag>) {
  return (
    <AnimatePresence>
      {props?.open && (
        <DialogPrimitive
          data-slot="dialog"
          className={cn('relative z-50', className)}
          {...props}
          static
        />
      )}
    </AnimatePresence>
  )
}

type DialogBackdropProps<TTag extends React.ElementType = typeof motion.div> =
  DialogBackdropPrimitiveProps<TTag> & {
    className?: string;
    as?: TTag;
  };

function DialogBackdrop<TTag extends React.ElementType = typeof motion.div>(
  props: DialogBackdropProps<TTag>,
) {
  const { className, as = motion.div, ...rest } = props

  return (
    <DialogBackdropPrimitive
      key="dialog-backdrop"
      data-slot="dialog-backdrop"
      className={cn('fixed inset-0 z-50 bg-black/80', className)}
      as={as as React.ElementType}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      {...rest}
    />
  )
}

type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

type DialogPanelProps<TTag extends React.ElementType = typeof motion.div> =
  Omit<DialogPanelPrimitiveProps<typeof motion.div>, 'transition'> &
    Omit<HTMLMotionProps<'div'>, 'children'> & {
      from?: FlipDirection;
      transition?: Transition;
      as?: TTag;
    };

function DialogPanel<TTag extends React.ElementType = typeof motion.div>(
  props: DialogPanelProps<TTag>,
) {
  const {
    children,
    className,
    as = motion.div,
    from = 'top',
    transition = { type: 'spring', stiffness: 150, damping: 25 },
    ...rest
  } = props

  const initialRotation =
    from === 'top' || from === 'left' ? '20deg' : '-20deg'
  const isVertical = from === 'top' || from === 'bottom'
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY'

  return (
    <DialogPanelPrimitive
      key="dialog-panel"
      data-slot="dialog-panel"
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-xl',
        className,
      )}
      as={as as React.ElementType}
      initial={{
        opacity: 0,
        filter: 'blur(4px)',
        transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
        transition,
      }}
      animate={{
        opacity: 1,
        filter: 'blur(0px)',
        transform: `perspective(500px) ${rotateAxis}(0deg) scale(1)`,
        transition,
      }}
      exit={{
        opacity: 0,
        filter: 'blur(4px)',
        transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
        transition,
      }}
      {...rest}
    >
      {(bag) => (
        <>
          {typeof children === 'function' ? children(bag) : children}

          <CloseButton
            data-slot="dialog-panel-close"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </CloseButton>
        </>
      )}
    </DialogPanelPrimitive>
  )
}

type DialogHeaderProps<TTag extends React.ElementType = 'div'> =
  React.ComponentProps<TTag> & {
    as?: TTag;
  };

function DialogHeader<TTag extends React.ElementType = 'div'>({
  className,
  as: Component = 'div',
  ...props
}: DialogHeaderProps<TTag>) {
  return (
    <Component
      data-slot="dialog-header"
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  )
}

type DialogFooterProps<TTag extends React.ElementType = 'div'> =
  React.ComponentProps<TTag> & {
    as?: TTag;
  };

function DialogFooter({
  className,
  as: Component = 'div',
  ...props
}: DialogFooterProps) {
  return (
    <Component
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end gap-2',
        className,
      )}
      {...props}
    />
  )
}

type DialogTitleProps<TTag extends React.ElementType = 'h2'> =
  DialogTitlePrimitiveProps<TTag> & {
    className?: string;
    as?: TTag;
  };

function DialogTitle<TTag extends React.ElementType = 'h2'>({
  className,
  ...props
}: DialogTitleProps<TTag>) {
  return (
    <DialogTitlePrimitive
      data-slot="dialog-title"
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

type DialogDescriptionProps<TTag extends React.ElementType = 'div'> =
  React.ComponentProps<typeof DialogDescriptionPrimitive<TTag>> & {
    className?: string;
    as?: TTag;
  };

function DialogDescription<TTag extends React.ElementType = 'div'>({
  className,
  ...props
}: DialogDescriptionProps<TTag>) {
  return (
    <DialogDescriptionPrimitive
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBackdrop,
  type DialogBackdropProps,
  DialogDescription,
  type DialogDescriptionProps,
  DialogFooter,
  type DialogFooterProps,
  DialogHeader,
  type DialogHeaderProps,
  DialogPanel,
  type DialogPanelProps,
  type DialogProps,
  DialogTitle,
  type DialogTitleProps,
}
