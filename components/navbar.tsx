'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Journey', href: '#journey' },
  { label: 'Awards', href: '#awards' },
  { label: 'Portals', href: '#portals' },
  { label: 'Startups', href: '#startups' },
  { label: 'Mentors', href: '#mentors' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // IntersectionObserver is layout-based, not scroll-event-based — this
    // stays accurate with Lenis smooth-scroll, which can desync from native
    // `scroll` events / window.scrollY in some configurations, which was
    // causing the navbar to get stuck fully transparent while scrolled deep
    // into the page (content visibly overlapping through it).
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-24px 0px 0px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Sentinel sits at the very top of the page. The instant it scrolls
          out of view, the navbar switches to its opaque state. */}
      <div ref={sentinelRef} className="pointer-events-none absolute left-0 top-0 h-px w-full" />
      <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          'flex w-full max-w-5xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5',
          'bg-background/55 backdrop-blur-md border border-border/40',
          scrolled && 'glass-strong',
        )}
      >
        <a href="#top" className="flex items-center gap-2.5" aria-label="I2I home">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_16px_-2px_var(--amber)]">
            <Flame className="size-5" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-semibold tracking-tight">I2I</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Bhau Institute
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/register"
            className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--amber-soft)] sm:inline-flex"
          >
            Register Now
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full glass md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="glass-strong absolute inset-x-4 top-20 flex flex-col gap-1 rounded-2xl p-3 md:hidden"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/register"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
            >
              Register Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.header>
    </>
  )
}
