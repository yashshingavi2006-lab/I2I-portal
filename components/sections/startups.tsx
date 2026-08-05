'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

const startups = [
  // MediFindRx is a REAL i2i project (verified via public LinkedIn posts
  // from its team) — a healthcare tech platform built during the i2i
  // program. I2I does not publish a public gallery of past winning
  // projects, so additional real names couldn't be verified the same way.
  // The remaining cards are placeholders in real i2i sectors — replace
  // with real project names once you have them from Secretary records.
  {
    name: 'MediFindRx',
    sector: '3H - Health, Hunger & Humanity',
    stage: 'i2i Cohort',
    blurb: 'Real-time medicine availability, pharmacy and hospital connections, ambulance and bed booking for emergency healthcare access.',
    image: '/startups/medhya.png',
  },
  {
    name: '[Add your next project]',
    sector: 'Environment',
    stage: 'i2i Cohort',
    blurb: 'Placeholder - replace with a real i2i project once you have the name and details.',
    image: '/startups/verdantiq.png',
  },
  {
    name: '[Add your next project]',
    sector: 'Education',
    stage: 'i2i Cohort',
    blurb: 'Placeholder - replace with a real i2i project once you have the name and details.',
    image: '/startups/aerograft.png',
  },
]

export function Startups() {
  return (
    <Section id="startups">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Featured Startups"
          title="Built by students. Backed by I2I."
          description="A snapshot of ventures born inside the ecosystem, now solving real problems at scale."
        />
      </div>

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {startups.map((s, i) => (
          <StaggerItem key={`${s.name}-${i}`}>
            <motion.article
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group glass relative flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-[color:color-mix(in_oklch,var(--amber)_45%,transparent)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={s.image || '/placeholder.svg'}
                  alt={`${s.name} product visual`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-border bg-background/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
                  {s.sector}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold tracking-tight">{s.name}</h3>
                  <span className="rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                    {s.stage}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.blurb}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  View venture <ArrowUpRight className="size-4" />
                </span>
              </div>
            </motion.article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  )
}
