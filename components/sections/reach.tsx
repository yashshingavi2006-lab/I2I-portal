'use client'

import { Section, SectionHeader } from '@/components/section'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion-primitives'
import { ReachMap } from '@/components/reach-map'

const stats = [
  { num: '12', label: 'Regions covered' },
  { num: '15+', label: 'E-cells & activity clubs' },
  { num: '4', label: 'Months of outreach' },
]

export function Reach() {
  return (
    <Section id="reach">
      <SectionHeader
        eyebrow="Statewide Reach"
        title="Twelve regions. One outreach circuit across Maharashtra."
        description="July–October 2024: the I2I team crossed Maharashtra to reconnect with colleges and build new relationships with E-cells, activity clubs, faculty, and Training & Placement Offices — covering every major region of the state."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <Reveal delay={0.1}>
          <ReachMap />
        </Reveal>

        <div className="flex flex-col gap-5">
          <StaggerGroup className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <div className="glass rounded-2xl px-4 py-4 text-center">
                  <p className="font-display text-2xl font-bold tabular-nums text-primary">{s.num}</p>
                  <p className="mt-1.5 text-[11px] leading-tight text-muted-foreground">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal delay={0.15}>
            <div className="glass rounded-2xl p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                Major Activities &amp; Events
              </p>
              <h3 className="mt-2 font-display text-lg font-bold">Statewide Outreach &amp; Publicity</h3>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">Duration: July – October 2024</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Publicity was conducted across{' '}
                <span className="border-b border-primary/50 text-foreground">Marathwada</span>,{' '}
                <span className="border-b border-primary/50 text-foreground">Pune region</span>,{' '}
                <span className="border-b border-primary/50 text-foreground">Satara</span>,{' '}
                <span className="border-b border-primary/50 text-foreground">Sangli</span>, and{' '}
                <span className="border-b border-primary/50 text-foreground">Kolhapur</span>, and in
                reconnecting with colleges in{' '}
                <span className="border-b border-primary/50 text-foreground">Nashik</span>,{' '}
                <span className="border-b border-primary/50 text-foreground">Nagar</span>, and{' '}
                <span className="border-b border-primary/50 text-foreground">Amravati</span> and Nagpur.
                The team connected with 15+ E-cells and student activity clubs, building strong
                relationships with faculty members, Training &amp; Placement Offices, and
                institutional leaders across Maharashtra.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
