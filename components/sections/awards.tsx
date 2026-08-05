'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, Building2, Users } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

const AWARDS = [
  {
    icon: Medal,
    title: 'Sector Winners',
    desc: 'Best Project and Runner Up in each of the 6 sectors — 12 teams honored with a trophy, merchandise, and certificate.',
  },
  {
    icon: Trophy,
    title: 'Overall Best Project',
    desc: 'One team, selected across all sectors, wins the top trophy and a featured spot on the website and yearly brochure.',
  },
  {
    icon: Building2,
    title: 'Best Philanthropist Award',
    desc: "Given to the college with the strongest body of quality projects, unlocking access to i2i's online workshops.",
  },
  {
    icon: Users,
    title: 'Best Outside Ambassador',
    desc: 'Recognizes an ambassador\'s contribution to i2i with a trophy, certificate, and exclusive merchandise.',
  },
]

export function Awards() {
  return (
    <Section id="awards">
      <SectionHeader
        eyebrow="Awards"
        title="What's on the line at Valedictory"
        description="Twelve sector winners, one overall champion, and recognition that carries beyond the ceremony."
        align="center"
      />

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {AWARDS.map((a) => (
          <StaggerItem key={a.title}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group glass relative h-full overflow-hidden rounded-2xl p-6 transition-colors duration-300 hover:border-[color:color-mix(in_oklch,var(--amber)_40%,transparent)]"
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(360px circle at 50% 0%, color-mix(in oklch, var(--amber) 10%, transparent), transparent 70%)',
                }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-4">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
                  <a.icon className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold tracking-tight">{a.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  )
}
