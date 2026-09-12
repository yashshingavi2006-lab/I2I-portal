'use client'

import { motion } from 'framer-motion'
import { GraduationCap, FileSearch, Banknote, Award, HandHeart, Sprout, Lightbulb, Leaf, Rocket } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem, Reveal } from '@/components/motion-primitives'
import { WatchStoryButton } from '@/components/watch-story-modal'

const sectors = [
  { icon: HandHeart, label: '3H (Health, Hunger, Humanity)' },
  { icon: Sprout, label: 'Agriculture' },
  { icon: GraduationCap, label: 'Education' },
  { icon: Lightbulb, label: 'Innovation & Technology' },
  { icon: Leaf, label: 'Environment' },
  { icon: Rocket, label: 'Entrepreneurship' },
]

const pillars = [
  {
    icon: GraduationCap,
    title: 'Phase 1 — Registration',
    body: 'Registration opens each year across multiple sectors and closes in the last week of September. Open to Indian resident students nationwide, eligible to compete for i2i funding.',
  },
  {
    icon: FileSearch,
    title: 'Phase 2 — Screening',
    body: 'Participating teams submit a project proposal and presentation outlining their idea, budget, and impact — the basis on which funded projects are selected.',
  },
  {
    icon: Banknote,
    title: 'Phase 3 — Mentoring',
    body: "Selected projects receive funds released per i2i's guidelines, giving teams a defined window to build and complete a working model of their idea.",
  },
  {
    icon: Award,
    title: 'Phase 4 — Recognition',
    body: 'Shortlisted projects pitch to a panel of industrialists, with the best teams honored at the Valedictory Ceremony at COEP Technological University.',
  },
]

export function About() {
  return (
    <Section id="about">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader
            eyebrow="About I2I"
            title={
              <>
                Where student ambition becomes{' '}
                <span className="text-gradient-amber">enduring enterprise</span>
              </>
            }
            description="Ignited Innovators of India was founded by Prof. Sanjay Inamdar with the blessing of Dr. APJ Abdul Kalam, and operates under COEP Technological University's Bhau Institute of Entrepreneurship & Leadership, with the continued support of Eaton India Foundation. The initiative develops student entrepreneurs and leaders who create lasting techno-social impact."
          />
          <Reveal delay={0.1}>
            <div className="mt-6">
              <WatchStoryButton />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {sectors.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-3"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
                    <s.icon className="size-4" />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <StaggerGroup className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group glass relative h-full overflow-hidden rounded-2xl p-6 transition-colors duration-300 hover:border-[color:color-mix(in_oklch,var(--amber)_40%,transparent)]"
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(400px circle at 50% 0%, color-mix(in oklch, var(--amber) 10%, transparent), transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex flex-col gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
                    <p.icon className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </Section>
  )
}
