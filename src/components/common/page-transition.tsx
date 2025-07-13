'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
