'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Section, SectionHeader } from '@/components/section'
import { LinkedInIcon } from '@/components/social-icons'
import { StaggerGroup, StaggerItem, Reveal } from '@/components/motion-primitives'

// Leadership sourced verbatim from i2i.org.in's "Our Backbone" and "Our
// Executive Team" sections.
const leadership = [
  { name: 'Prof. Sanjay Inamdar', role: 'Co-Founder – BIEL & Chief Mentor – i2i', org: 'BIEL / i2i', initials: 'SI' },
  { name: 'Prof. Sunil Bhirud', role: 'Vice Chancellor', org: 'COEP Tech', initials: 'SB' },
  { name: 'Dr. Vidya N. More', role: 'Faculty Advisor', org: 'i2i', initials: 'VM' },
  { name: 'Mr. Swapnil Mali', role: 'AGM', org: 'BIEL', initials: 'SM' },
  { name: 'Mr. Vikas Kamble', role: 'Project Research Assistant', org: 'i2i', initials: 'VK' },
]

// Real Eaton mentors who guide the i2i program, sourced from i2i's official
// site (i2i.org.in) and public LinkedIn posts from past i2i cohorts.
// Individual role titles beyond "Eaton Mentor" weren't publicly confirmable
// for each person except Vikas Khule — update these once you have exact
// designations from the Eaton coordination team.
const mentors = [
  { name: 'Abhijeet Waghmare', role: 'Eaton Mentor', org: 'Eaton', initials: 'AW' },
  { name: 'Bobby Zachariah', role: 'Eaton Mentor', org: 'Eaton', initials: 'BZ' },
  { name: 'Anuja Pendse', role: 'Eaton Mentor', org: 'Eaton', initials: 'AP' },
  { name: 'Bhavya Modi', role: 'Eaton Mentor', org: 'Eaton', initials: 'BM' },
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

function PersonCard({ m }: { m: { name: string; role: string; org: string; initials: string } }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group glass relative flex h-full flex-col items-center gap-3 rounded-2xl p-5 text-center transition-colors duration-300 hover:border-[color:color-mix(in_oklch,var(--amber)_45%,transparent)]"
    >
      <div className="relative">
        <div className="grid size-16 place-items-center rounded-full bg-secondary font-display text-lg font-semibold text-foreground ring-1 ring-inset ring-border">
          {m.initials}
        </div>
        <span className="absolute inset-0 rounded-full ring-2 ring-primary/0 transition-all duration-300 group-hover:ring-primary/50" />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold leading-tight">{m.name}</p>
        <p className="text-xs text-primary">{m.role}</p>
        <p className="text-[11px] text-muted-foreground">{m.org}</p>
      </div>
      <span
        className="mt-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      >
        <LinkedInIcon className="size-4" />
      </span>
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
          Eaton Mentors
        </p>
        <StaggerGroup className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {mentors.map((m) => (
            <StaggerItem key={m.name}>
              <PersonCard m={m} />
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
