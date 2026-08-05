'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Compass, GraduationCap, LayoutGrid, Handshake } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

const programs = [
  {
    icon: Compass,
    title: 'Ignite Fellowship',
    body: 'A semester-long founder residency with weekly mentorship, micro-grants, and demo-day access.',
    tag: 'Flagship',
    featured: true,
  },
  {
    icon: GraduationCap,
    title: 'Pre-Incubation Lab',
    body: 'Validate your idea with structured discovery sprints before committing to a full build.',
    tag: 'Early stage',
  },
  {
    icon: LayoutGrid,
    title: 'Founder Portal',
    body: 'Your single dashboard for applications, mentor bookings, resources, and funding tracks.',
    tag: 'Portal',
  },
  {
    icon: Handshake,
    title: 'Corporate Innovation',
    body: 'Co-build with industry partners on real problem statements and pilot deployments.',
    tag: 'Partnerships',
  },
]

export function Programs() {
  return (
    <Section id="programs">
      <SectionHeader
        eyebrow="Programs & Portals"
        title="Choose your track into the ecosystem"
        description="Whether you have a napkin sketch or a working prototype, there is a program built for your stage."
        align="center"
      />

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {programs.map((p) => (
          <StaggerItem
            key={p.title}
            className={p.featured ? 'lg:row-span-1' : ''}
          >
            <motion.a
              href="#top"
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl p-6 transition-colors duration-300 ${
                p.featured
                  ? 'bg-primary text-primary-foreground'
                  : 'glass hover:border-[color:color-mix(in_oklch,var(--amber)_45%,transparent)]'
              }`}
            >
              {!p.featured && (
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(360px circle at 50% 0%, color-mix(in oklch, var(--amber) 10%, transparent), transparent 70%)',
                  }}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-center justify-between">
                <span
                  className={`grid size-11 place-items-center rounded-xl ${
                    p.featured
                      ? 'bg-primary-foreground/15 text-primary-foreground'
                      : 'bg-primary/12 text-primary ring-1 ring-inset ring-primary/20'
                  }`}
                >
                  <p.icon className="size-5" />
                </span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest ${
                    p.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {p.tag}
                </span>
              </div>
              <div className="relative flex flex-1 flex-col gap-2">
                <h3 className="font-display text-lg font-semibold tracking-tight">{p.title}</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    p.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {p.body}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium">
                  Learn more <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </motion.a>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  )
}
