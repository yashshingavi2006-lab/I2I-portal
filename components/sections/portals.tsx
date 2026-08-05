'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

const PORTALS = [
  {
    title: 'Secretary',
    desc: 'Master access — manage all registrations, phases, assignments, and funding.',
    href: '/login?portal=secretary',
  },
  {
    title: 'Eaton Mentor',
    desc: 'Eaton mentors — view and guide your assigned projects through implementation.',
    href: '/login?portal=mentor',
  },
  {
    title: 'Ambassadors',
    desc: 'Chief ambassadors & ambassadors — track and support your assigned projects.',
    href: '/login?portal=ambassador',
  },
  {
    title: 'Participants',
    desc: 'Team leaders — track your project\'s progress through each phase.',
    href: '/login?portal=participant',
  },
]

export function Portals() {
  return (
    <Section id="portals">
      <SectionHeader
        eyebrow="Portals"
        title="One platform, four journeys"
        description="Every role in the I2I ecosystem has a dedicated portal built around what they need to get done."
        align="center"
      />

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PORTALS.map((p) => (
          <StaggerItem key={p.title}>
            <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
              <Link
                href={p.href}
                className="group relative block h-full overflow-hidden rounded-2xl glass p-6 transition-colors duration-300 hover:border-[color:color-mix(in_oklch,var(--amber)_45%,transparent)]"
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(360px circle at 50% 0%, color-mix(in oklch, var(--amber) 10%, transparent), transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex h-full flex-col gap-2">
                  <h3 className="font-display text-lg font-semibold tracking-tight">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary">
                    Log in
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  )
}
