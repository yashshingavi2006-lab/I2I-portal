'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

// Real testimonials from the i2i community (i2i.org.in), reworded in our
// own words rather than quoted verbatim from the original site. These are
// from ambassadors/coordinators rather than "founders" of funded
// companies — I2I is a student social-innovation competition, so that's
// the accurate framing rather than the placeholder's startup-founder tone.
const testimonials = [
  {
    quote:
      'Being part of I2I-BHAU showed me that real social change starts with people like us choosing to get involved. It genuinely is a platform to become the kind of change-maker our communities need.',
    name: 'Rameshwar Walkikar',
    role: 'Outside Ambassador, Avsari',
    initials: 'RW',
  },
  {
    quote:
      'Working with I2I at Bhau Institute was an incredible experience — the relationships I built and the chance to give back shaped how I lead and manage teams today.',
    name: 'Ishwari Chandekar',
    role: 'Coordinator, i2i',
    initials: 'IC',
  },
  {
    quote:
      "This journey taught me to learn how to learn, a lesson from Sanjay Inamdar sir that stuck with me. I move slowly, but never alone — the team is what holds it all together.",
    name: 'Harshvardhan Dhote',
    role: 'Coordinator, i2i',
    initials: 'HD',
  },
]

export function Testimonials() {
  return (
    <Section id="testimonials">
      <SectionHeader
        eyebrow="Testimonials"
        title="Voices from the i2i community"
        description="What ambassadors and coordinators say after moving through the I2I ecosystem."
        align="center"
      />

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <motion.figure
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="glass flex h-full flex-col gap-6 rounded-2xl p-6 transition-colors duration-300 hover:border-[color:color-mix(in_oklch,var(--amber)_40%,transparent)]"
            >
              <Quote className="size-7 text-primary" />
              <blockquote className="flex-1 text-pretty text-[15px] leading-relaxed text-foreground/90">
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-border pt-5">
                <span className="grid size-11 place-items-center rounded-full bg-secondary font-display text-sm font-semibold ring-1 ring-inset ring-border">
                  {t.initials}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  )
}
