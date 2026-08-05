'use client'

import { Flame, ArrowUpRight } from 'lucide-react'
import { MagneticButton } from '@/components/magnetic-button'
import { GradientOrbs } from '@/components/background-fx'
import { Reveal } from '@/components/motion-primitives'
import { LinkedInIcon, InstagramIcon, YoutubeIcon } from '@/components/social-icons'

const columns = [
  {
    title: 'Portals',
    links: ['Secretary', 'Participants', 'Mentors', 'Ambassadors'],
  },
  {
    title: 'Ecosystem',
    links: ['Startups', 'Mentors', 'Partners', 'Sponsors'],
  },
  {
    title: 'Institute',
    links: ['About Bhau', 'COEP Tech', 'Guidelines & Policies', 'Contact'],
  },
]

const socials = [
  { icon: LinkedInIcon, label: 'LinkedIn', href: 'https://www.linkedin.com/company/ignited-innovators-of-india/posts/?feedView=all' },
  { icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/i2i_coep/' },
  { icon: YoutubeIcon, label: 'YouTube', href: 'https://www.youtube.com/@i2icoeptech' },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <GradientOrbs className="opacity-60" />
      <div className="absolute inset-0 grid-texture opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* CTA */}
        <Reveal>
          <div className="glass-strong relative -mt-px overflow-hidden rounded-3xl p-8 sm:p-14">
            <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3">
                <h2 className="max-w-xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Have an idea worth building?
                </h2>
                <p className="max-w-lg text-pretty text-muted-foreground">
                  Applications for the next I2I cohort are open. Bring the ambition, we bring the
                  ecosystem.
                </p>
              </div>
              <MagneticButton href="#top">
                Apply Now
                <ArrowUpRight className="size-4" />
              </MagneticButton>
            </div>
          </div>
        </Reveal>

        {/* links */}
        <div className="grid grid-cols-2 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-4">
            <a href="#top" className="flex items-center gap-2.5" aria-label="I2I home">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <Flame className="size-5" strokeWidth={2.2} />
              </span>
              <span className="font-display text-base font-semibold tracking-tight">
                Ignited Innovators of India
              </span>
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              The flagship innovation and entrepreneurship initiative of Bhau Institute, COEP
              Technological University, Pune.
            </p>
            <div className="mt-2 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full glass text-muted-foreground transition-colors hover:text-foreground"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} className="flex flex-col gap-3" aria-label={col.title}>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {col.title}
              </p>
              {col.links.map((link) => (
                <a
                  key={link}
                  href={link === 'Guidelines & Policies' ? '/guidelines' : '#top'}
                  className="text-sm text-foreground/70 transition-colors hover:text-primary"
                >
                  {link}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ignited Innovators of India · Bhau Institute, COEP
            Technological University.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#top" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#top" className="transition-colors hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
