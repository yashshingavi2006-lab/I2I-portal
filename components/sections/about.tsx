'use client'

import { motion } from 'framer-motion'
import { Rocket, Users, Lightbulb, Building2 } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem, Reveal } from '@/components/motion-primitives'

const pillars = [
  {
    icon: Lightbulb,
    title: 'Idea to Prototype',
    body: 'Structured validation sprints, design studios, and rapid prototyping labs to pressure-test every hypothesis.',
  },
  {
    icon: Rocket,
    title: 'Venture Acceleration',
    body: 'Go-to-market playbooks, pilot customers, and growth capital to move ventures from launch to traction.',
  },
  {
    icon: Users,
    title: 'Founder Community',
    body: 'A peer network of student founders, alumni operators, and domain experts building in the open, together.',
  },
  {
    icon: Building2,
    title: 'Deep Industry Access',
    body: 'Direct lines to corporates, investors, and research labs through the Bhau Institute partner network.',
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
            description="Ignited Innovators of India is the flagship initiative of the Bhau Institute of Entrepreneurship & Leadership at COEP Technological University. We equip students with the mindset, mentorship, and machinery to build ventures that matter."
          />
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {['Health', 'Agriculture', 'Education', 'Innovation', 'Environment', 'Entrepreneurship'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
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
