'use client'

import { type ReactNode, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'ghost'
  href?: string
  onClick?: () => void
  ariaLabel?: string
}

export function MagneticButton({
  children,
  className,
  variant = 'primary',
  href,
  onClick,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function handleMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    setPos({ x: x * 0.25, y: y * 0.25 })
  }

  function reset() {
    setPos({ x: 0, y: 0 })
  }

  const base =
    'relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-tight transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

  const styles =
    variant === 'primary'
      ? 'bg-primary text-primary-foreground hover:bg-[var(--amber-soft)] shadow-[0_0_0_1px_color-mix(in_oklch,var(--amber)_40%,transparent),0_10px_40px_-12px_color-mix(in_oklch,var(--amber)_60%,transparent)]'
      : 'glass text-foreground hover:border-[color:color-mix(in_oklch,var(--amber)_45%,transparent)]'

  const inner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.4 }}
      className="inline-block"
    >
      <span className={cn(base, styles, className)}>{children}</span>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className="inline-block">
        {inner}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className="inline-block">
      {inner}
    </button>
  )
}
