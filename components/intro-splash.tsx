'use client'

import { useLayoutEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { Particles } from '@/components/background-fx'

const SESSION_KEY = 'i2i-intro-seen'

const easeOut = [0.16, 1, 0.3, 1] as const

export function IntroSplash() {
  // Optimistic default (show the intro) — corrected synchronously before
  // paint in useLayoutEffect, so a repeat visit within the same tab session
  // doesn't flash the splash before hiding it.
  const [show, setShow] = useState(true)
  const [exiting, setExiting] = useState(false)

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const seen = sessionStorage.getItem(SESSION_KEY)
    if (seen || reduced) {
      setShow(false)
      return
    }
    sessionStorage.setItem(SESSION_KEY, '1')
    const timer = setTimeout(() => setExiting(true), 2400)
    return () => clearTimeout(timer)
  }, [])

  function skip() {
    setExiting(true)
  }

  return (
    <AnimatePresence onExitComplete={() => setShow(false)}>
      {show && !exiting && (
        <motion.div
          key="intro-splash"
          onClick={skip}
          exit={{
            clipPath: 'circle(0% at 50% 50%)',
            transition: { duration: 0.9, ease: easeOut },
          }}
          className="fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden bg-background"
          style={{ clipPath: 'circle(150% at 50% 50%)' }}
        >
          <Particles count={40} />

          <motion.div
            className="pointer-events-none absolute size-[520px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, color-mix(in oklch, var(--amber) 35%, transparent), transparent 70%)',
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: easeOut }}
          />

          <div className="relative flex flex-col items-center gap-6">
            <motion.span
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
              className="grid size-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_50px_-4px_var(--amber)]"
            >
              <Flame className="size-10" strokeWidth={2} />
            </motion.span>

            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
              transition={{ duration: 1.6, delay: 0.5, ease: 'easeOut' }}
              className="pointer-events-none absolute top-0 size-20 rounded-full border border-primary"
            />

            <div className="flex flex-col items-center gap-1 overflow-hidden">
              <motion.span
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.7, ease: easeOut, delay: 0.55 }}
                className="font-display text-4xl font-bold tracking-tight sm:text-6xl"
              >
                I2I
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeOut, delay: 0.95 }}
                className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground sm:text-sm"
              >
                Ignited Innovators of India
              </motion.span>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              skip()
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="absolute bottom-8 rounded-full border border-border/60 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
