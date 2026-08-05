'use client'

import { motion } from 'framer-motion'
import { Rocket, Banknote, Users, Award } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'
import { Counter } from '@/components/counter'
import { GradientOrbs } from '@/components/background-fx'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

const stats = [
  { icon: Rocket, to: 120, suffix: '+', label: 'Startups incubated', hint: 'Across 6 verticals' },
  { icon: Banknote, prefix: '₹', to: 40, suffix: 'Cr+', label: 'Capital mobilised', hint: 'Grants & seed rounds' },
  { icon: Users, to: 9000, suffix: '+', label: 'Innovators engaged', hint: 'Students & alumni' },
  { icon: Award, to: 65, suffix: '+', label: 'National awards', hint: 'Hackathons & pitches' },
]

export function Statistics() {
  return (
    <div className="relative overflow-hidden border-y border-border">
      <GradientOrbs className="opacity-70" />
      <div className="absolute inset-0 grid-texture opacity-40" aria-hidden="true" />
      <Section className="relative">
        <SectionHeader
          eyebrow="Live Statistics"
          title="Momentum you can measure"
          description="Real outcomes from a growing ecosystem of student founders, mentors, and industry partners."
          align="center"
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass group h-full rounded-2xl p-6 transition-colors duration-300 hover:border-[color:color-mix(in_oklch,var(--amber)_40%,transparent)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
                  <s.icon className="size-5" />
                </span>
                <p className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground">
                  <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Section>
    </div>
  )
}
