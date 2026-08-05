'use client'

import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'

// Real i2i ambassador activities, sourced from i2i.org.in/activities/.
// These are a numbered program of activities (not month-dated calendar
// events like the original placeholder implied), so cards are labeled by
// order rather than a specific month.
const events = [
  {
    tag: '01',
    name: 'My Social Start-up',
    desc: 'Ambassadors formed groups and selected Social Problem Cards, taking on roles like CEO, Marketing, Finance, and R&D to simulate a real social enterprise.',
    outcome: 'Business thinking, social responsibility, teamwork',
  },
  {
    tag: '02',
    name: '60-Second Challenge',
    desc: 'An individual activity where participants identified a ground-level problem and proposed a solution within 60 seconds.',
    outcome: 'Time efficiency, critical thinking',
  },
  {
    tag: '03',
    name: 'If I Were the Founder',
    desc: 'Ambassadors proposed meaningful social changes to existing startups — e.g. "If I were the founder of Zomato, I would mandate sustainable containers."',
    outcome: 'Social innovation, creative problem-solving',
  },
  {
    tag: '04',
    name: 'Developing an Ecosystem',
    desc: 'Instead of plain donations, ambassadors built a self-sustaining model — collecting pens from the team and distributing them to underprivileged individuals to sell.',
    outcome: 'Practical understanding of social enterprise dynamics',
  },
  {
    tag: '05',
    name: 'Publicity Activity',
    desc: "Ambassadors trained in publicity methods and applied them live at Mindspark, COEP Tech's annual fest, engaging the public directly.",
    outcome: 'Overcoming stage fear, public engagement',
  },
  {
    tag: '06',
    name: 'Calling Pitch',
    desc: "Ambassadors trained to communicate i2i's vision over calls — delivering concise, engaging, and persuasive pitches.",
    outcome: 'Communication, persuasion, professionalism',
  },
  {
    tag: 'Phase 2',
    name: 'Apno Wali Diwali',
    desc: 'A social initiative supporting local artisans during Diwali — participants bought diyas or handcrafted items from local vendors and shared the moment on Instagram with #ApnoWaliDiwali.',
    outcome: 'Community support, sustainable celebration, social engagement',
  },
]

export function AnnualTimeline() {
  return (
    <Section id="calendar">
      <SectionHeader
        eyebrow="Activities"
        title="Seven activities, one mission"
        description="Throughout the year, i2i ambassadors run a structured set of activities that build real entrepreneurial and social skills."
      />

      <div className="mt-14 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative flex min-w-max gap-4">
          <div className="absolute left-0 right-0 top-7 h-px bg-border" aria-hidden="true" />
          {events.map((e, i) => (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-64 shrink-0"
            >
              <span className="relative z-10 grid size-14 place-items-center rounded-full bg-card ring-1 ring-border">
                <span className="grid size-11 place-items-center rounded-full bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
                  <CalendarDays className="size-5" />
                </span>
              </span>
              <div className="glass mt-5 flex h-full flex-col rounded-2xl p-5">
                <span className="font-mono text-xs uppercase tracking-widest text-primary">
                  {e.tag}
                </span>
                <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
                  {e.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">Outcome: </span>
                  {e.outcome}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
