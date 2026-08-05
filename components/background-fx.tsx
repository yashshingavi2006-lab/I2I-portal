'use client'

import { motion } from 'framer-motion'

/** Ambient floating gradient orbs used behind hero-like sections. */
export function GradientOrbs({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute -left-24 top-10 size-[420px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--amber) 22%, transparent), transparent 70%)' }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-1/3 size-[360px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--amber-deep) 18%, transparent), transparent 70%)' }}
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 size-[300px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--amber) 12%, transparent), transparent 70%)' }}
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/** Subtle animated particles. Deterministic positions to avoid hydration mismatch. */
export function Particles({ count = 26 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280
    const rnd = seed / 233280
    const rnd2 = ((i * 49297 + 9301) % 233280) / 233280
    return {
      left: `${(rnd * 100).toFixed(2)}%`,
      top: `${(rnd2 * 100).toFixed(2)}%`,
      delay: (rnd * 6).toFixed(2),
      duration: (8 + rnd2 * 8).toFixed(2),
      size: rnd > 0.85 ? 2.5 : 1.5,
    }
  })

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-primary/60"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.8, 0] }}
          transition={{
            duration: Number(p.duration),
            delay: Number(p.delay),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
