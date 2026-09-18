'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Section, SectionHeader } from '@/components/section'
import { LinkedInIcon } from '@/components/social-icons'
import { StaggerGroup, StaggerItem, Reveal } from '@/components/motion-primitives'

// Leadership sourced verbatim from i2i.org.in's "Our Backbone" and "Our
// Executive Team" sections.
const leadership = [
  { name: 'Prof. Sanjay Inamdar', role: 'Co-Founder – BIEL & Founder – i2i', org: 'BIEL / i2i', initials: 'SI', photo: '/mentors/sanjay-inamdar.jpg' },
  { name: 'Prof. Sunil Bhirud', role: 'Vice Chancellor', org: 'COEP Tech', initials: 'SB', photo: '/mentors/sunil-bhirud.jpg' },
  { name: 'Dr. AM More', role: 'Faculty Advisor', org: 'i2i', initials: 'AM', photo: '/mentors/am-more.jpg' },
  { name: 'Mr. Swapnil Mali', role: 'AGM', org: 'BIEL', initials: 'SM', photo: '/mentors/swapnil-mali.jpg' },
  { name: 'Ms. Mayuri Kamble', role: 'Project Research Assistant', org: 'i2i', initials: 'MK', photo: '/mentors/mayuri-kamble.jpg' },
]

// Past student Secretaries who have run i2i's day-to-day operations each
// year, sourced from i2i.org.in's team page.
const pastSecretaries = [
  { name: 'Mr. Aditya Kasod', role: 'Secretary (2025-26)', org: 'i2i', initials: 'AK', photo: '/mentors/aditya-kasod.webp' },
  { name: 'Mr. Atharva Shingane', role: 'Secretary (2024-25)', org: 'i2i', initials: 'AS', photo: '/mentors/atharva-shingane.webp' },
  { name: 'Mr. Saket Kaswa', role: 'Secretary (2023-24)', org: 'i2i', initials: 'SK', photo: '/mentors/saket-kaswa.jpg' },
  { name: 'Mr. Soham Methul', role: 'Secretary (2022-23)', org: 'i2i', initials: 'SM', photo: '/mentors/soham-methul.webp' },
]

// Real Eaton coordinators who guide the i2i program, sourced from i2i's
// official site (i2i.org.in) and public LinkedIn posts from past i2i
// cohorts. Individual role titles beyond "Eaton Coordinator" weren't
// publicly confirmable for each person except Vikas Khule — update these
// once you have exact designations from the Eaton coordination team.
const eatonCoordinators = [
  { name: 'Abhijeet Waghmare', role: 'Eaton Coordinator', org: 'Eaton', initials: 'AW' },
  { name: 'Bobby Zachariah', role: 'Eaton Coordinator', org: 'Eaton', initials: 'BZ' },
  { name: 'Anuja Pendse', role: 'Eaton Coordinator', org: 'Eaton', initials: 'AP' },
  { name: 'Bhavya Modi', role: 'Eaton Coordinator', org: 'Eaton', initials: 'BM' },
  { name: 'Vikas Khule', role: 'Engineering Manager', org: 'Eaton India', initials: 'VK' },
]

// I2I has one sponsor: Eaton. The marquee alternates the Eaton wordmark
// (logo, not text — same pill size as the text entry) with "Eaton India
// Foundation", the real, distinct designation used across i2i's official
// materials. Repeated several times so the track is dense enough to scroll
// smoothly rather than leaving empty space.
const partners: ({ type: 'logo' } | { type: 'text'; label: string })[] = Array(5)
  .fill([{ type: 'logo' as const }, { type: 'text' as const, label: 'Eaton India Foundation' }])
  .flat()

function PersonCard({
  m,
  compact,
}: {
  m: { name: string; role: string; org: string; initials: string; photo?: string }
  compact?: boolean
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group glass relative flex h-full flex-col overflow-hidden rounded-2xl text-center transition-colors duration-300 hover:border-[color:color-mix(in_oklch,var(--amber)_45%,transparent)]"
    >
      <div className={`relative w-full ${compact ? 'aspect-[5/3]' : 'aspect-square'}`}>
        {m.photo ? (
          <Image
            src={m.photo}
            alt={m.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            className={`grid h-full w-full place-items-center bg-secondary font-display font-semibold text-foreground ${compact ? 'text-lg' : 'text-2xl'}`}
          >
            {m.initials}
          </div>
        )}
        <span className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-primary/0 transition-all duration-300 group-hover:ring-primary/50" />
      </div>
      <div className={`flex flex-1 flex-col items-center gap-0.5 ${compact ? 'p-3' : 'p-4'}`}>
        <p className={`font-semibold leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>{m.name}</p>
        <p className="text-xs text-primary">{m.role}</p>
        <p className="text-[11px] text-muted-foreground">{m.org}</p>
        <span
          className="mt-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        >
          <LinkedInIcon className="size-4" />
        </span>
      </div>
    </motion.div>
  )
}

export function Mentors() {
  return (
    <Section id="mentors">
      <SectionHeader
        eyebrow="Mentors & Partners"
        title="Guided by operators who have built before"
        description="A curated bench of founders, investors, and industry leaders who mentor every I2I cohort."
      />

      <div className="mt-14">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Leadership
        </p>
        <StaggerGroup className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {leadership.map((m) => (
            <StaggerItem key={m.name}>
              <PersonCard m={m} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <div className="mt-12">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Past Secretaries
        </p>
        <StaggerGroup className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pastSecretaries.map((m) => (
            <StaggerItem key={m.name}>
              <PersonCard m={m} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <div className="mt-12">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Eaton Coordinators
        </p>
        <StaggerGroup className="mt-5 grid max-w-4xl grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {eatonCoordinators.map((m) => (
            <StaggerItem key={m.name}>
              <PersonCard m={m} compact />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <Reveal delay={0.1} className="mt-16">
        <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Backed by an ecosystem of industry partners
        </p>
        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-marquee mx-auto gap-4">
            {[...partners, ...partners].map((p, i) =>
              p.type === 'logo' ? (
                <span
                  key={i}
                  className="glass flex items-center whitespace-nowrap rounded-full px-6 py-3"
                >
                  <Image src="/eaton-logo.png" alt="Eaton" width={954} height={245} className="h-5 w-auto" />
                </span>
              ) : (
                <span
                  key={i}
                  className="glass whitespace-nowrap rounded-full px-6 py-3 font-display text-sm font-medium text-muted-foreground"
                >
                  {p.label}
                </span>
              )
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
