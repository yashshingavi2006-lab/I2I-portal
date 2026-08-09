'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { AnimatedText } from '@/components/motion-primitives'
import { MagneticButton } from '@/components/magnetic-button'
import { GradientOrbs, Particles } from '@/components/background-fx'
import { ReachMap } from '@/components/reach-map'
import { Scene3DBackground } from '@/components/scene-3d'

const easeOut = [0.16, 1, 0.3, 1] as const

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16"
    >
      <div className="absolute inset-0 grid-texture radial-fade opacity-60" aria-hidden="true" />
      <Scene3DBackground variant="network" className="opacity-70" />
      <GradientOrbs />
      <Particles />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start gap-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-mono uppercase tracking-[0.14em]">
              Bhau Institute · COEP Technological University
            </span>
          </motion.div>

          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.1rem]">
            <AnimatedText text="Ignited Innovators" />
            <br />
            <span className="text-gradient-amber">
              <AnimatedText text="of India" delay={0.3} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: easeOut }}
            className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            The flagship innovation and entrepreneurship initiative turning bold student
            ideas into deep-tech startups. Mentorship, capital, and a founder ecosystem
            engineered for the next generation of builders.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: easeOut }}
            className="flex flex-wrap items-center gap-3"
          >
            <MagneticButton href="#portals">
              Explore Portals
              <ArrowUpRight className="size-4" />
            </MagneticButton>
            <MagneticButton href="#startups" variant="ghost">
              View Startups
            </MagneticButton>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-4 grid grid-cols-3 gap-6 border-t border-border pt-6"
          >
            {/* UNVERIFIED — these numbers are v0's placeholder defaults, not
                confirmed real Bhau Institute/i2i figures. Replace with real
                numbers before going live. */}
            {[
              { v: '120+', l: 'Startups incubated' },
              { v: '₹40Cr+', l: 'Funding raised' },
              { v: '9,000+', l: 'Innovators' },
            ].map((s) => (
              <div key={s.l} className="flex flex-col gap-1">
                <dt className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {s.v}
                </dt>
                <dd className="text-xs leading-snug text-muted-foreground">{s.l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: easeOut }}
          className="relative mx-auto aspect-square w-full max-w-lg"
        >
          <div className="glass absolute inset-0 rounded-[2rem]" />
          <div className="absolute inset-4 overflow-hidden rounded-[1.5rem]">
            <ReachMap compact />
          </div>
          <div className="glass-strong absolute -bottom-4 left-6 flex items-center gap-3 rounded-2xl px-4 py-3">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Live ecosystem</span> · 42 active
              ventures
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
