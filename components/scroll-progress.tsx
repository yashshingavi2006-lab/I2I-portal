'use client'

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'

/** Thin fixed progress bar tracking scroll position through the whole page. */
export function ScrollProgress() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smoothed = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })

  return (
    <motion.div
      style={{ scaleX: shouldReduceMotion ? scrollYProgress : smoothed }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[var(--amber-deep)] via-[var(--amber)] to-[var(--amber-soft)]"
      aria-hidden="true"
    />
  )
}
