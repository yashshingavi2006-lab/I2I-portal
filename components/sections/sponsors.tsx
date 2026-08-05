'use client'

import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

const tiers = [
  {
    tier: 'Organized By',
    items: ['Bhau Institute of Innovation, Entrepreneurship & Leadership', 'COEP Technological University'],
  },
  {
    tier: 'Proudly Sponsored By',
    items: ['Eaton', 'Eaton India Foundation'],
  },
]

export function Sponsors() {
  return (
    <Section id="sponsors">
      <SectionHeader
        eyebrow="Sponsors"
        title="Powered by partners who believe in builders"
        align="center"
      />

      <div className="mt-14 flex flex-col gap-10">
        {tiers.map((t) => (
          <div key={t.tier} className="flex flex-col gap-5">
            <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t.tier}
            </p>
            <StaggerGroup className="flex flex-wrap justify-center gap-3">
              {t.items.map((item) => (
                <StaggerItem key={item}>
                  <div className="glass flex items-center justify-center rounded-xl px-8 py-5 font-display text-base font-semibold text-foreground/80 transition-colors duration-300 hover:text-foreground">
                    {item}
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        ))}
      </div>
    </Section>
  )
}
