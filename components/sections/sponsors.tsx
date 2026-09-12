'use client'

import Image from 'next/image'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

const tiers = [
  {
    tier: 'Organized By',
    items: [
      { name: 'Bhau Institute of Innovation, Entrepreneurship & Leadership', logo: '/logos/bhau-institute.png', w: 200, h: 183 },
      { name: 'COEP Technological University', logo: '/logos/coep-tech.png', w: 145, h: 180 },
    ],
  },
  {
    tier: 'Proudly Sponsored By',
    items: [{ name: 'Eaton', logo: '/logos/eaton.png', w: 196, h: 64 }],
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

      <div className="mt-16 flex flex-col gap-16">
        {tiers.map((t) => (
          <div key={t.tier} className="flex flex-col gap-8">
            <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t.tier}
            </p>
            <StaggerGroup className="flex flex-wrap items-center justify-center gap-12 sm:gap-16">
              {t.items.map((item) => (
                <StaggerItem key={item.name}>
                  <div
                    title={item.name}
                    className="flex h-32 w-40 items-center justify-center transition-transform duration-300 hover:-translate-y-1 sm:h-44 sm:w-56 md:h-52 md:w-64"
                  >
                    <Image
                      src={item.logo}
                      alt={item.name}
                      width={item.w}
                      height={item.h}
                      className="h-full w-full object-contain"
                    />
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
