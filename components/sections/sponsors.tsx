'use client'

import Image from 'next/image'
import { Section, SectionHeader } from '@/components/section'
import { StaggerGroup, StaggerItem } from '@/components/motion-primitives'

const tiers = [
  {
    tier: 'Organized By',
    items: [
      { name: 'Bhau Institute of Innovation, Entrepreneurship & Leadership', logo: '/logos/bhau-institute.png' },
      { name: 'COEP Technological University', logo: '/logos/coep-tech.png' },
    ],
  },
  {
    tier: 'Proudly Sponsored By',
    items: [{ name: 'Eaton', logo: '/logos/eaton.png' }],
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
            <StaggerGroup className="flex flex-wrap justify-center gap-4">
              {t.items.map((item) => (
                <StaggerItem key={item.name}>
                  <div
                    title={item.name}
                    className="flex items-center justify-center rounded-2xl bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                  >
                    <Image src={item.logo} alt={item.name} width={200} height={200} className="size-16 object-contain" />
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
