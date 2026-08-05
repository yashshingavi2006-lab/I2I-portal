'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Section, SectionHeader } from '@/components/section'

const steps = [
  {
    step: '01',
    period: 'Aug – Sep',
    title: 'Registration',
    body: 'Teams from across Maharashtra register their project idea and receive a unique project code to track their journey.',
  },
  {
    step: '02',
    period: 'October',
    title: 'Funding & Pitch',
    body: 'Shortlisted teams submit their budget, pitch their idea, and share bank details for potential funding support.',
  },
  {
    step: '03',
    period: 'Nov – Jan',
    title: 'Mentorship',
    body: 'A dedicated mentor from Eaton and an ambassador from COEP are assigned to guide the project through implementation.',
  },
  {
    step: '04',
    period: 'Feb – Mar',
    title: 'Valedictory',
    body: 'Finalists present their completed projects at COEP in front of the judging panel, with winners announced at the valedictory ceremony.',
  },
]

export function Journey() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 65%', 'end 60%'],
  })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <Section id="journey">
      <SectionHeader
        eyebrow="The Journey"
        title="Idea to impact, in four phases"
        description="Every project at I2I moves through four deliberate phases, from registration to the valedictory ceremony."
        align="center"
      />

      <div ref={containerRef} className="relative mt-16 pl-2 sm:pl-0">
        {/* rail */}
        <div className="absolute left-[19px] top-2 h-full w-px bg-border sm:left-1/2 sm:-translate-x-1/2" />
        <motion.div
          style={{ scaleY, transformOrigin: 'top' }}
          className="absolute left-[19px] top-2 h-full w-px bg-gradient-to-b from-primary via-primary to-transparent sm:left-1/2 sm:-translate-x-1/2"
        />

        <div className="flex flex-col gap-10">
          {steps.map((s, i) => {
            const isRight = i % 2 === 1
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex items-start gap-6 pl-12 sm:w-1/2 sm:pl-0 ${
                  isRight ? 'sm:ml-auto sm:pl-12' : 'sm:pr-12 sm:text-right'
                }`}
              >
                <span
                  className={`absolute left-[11px] top-1.5 z-10 grid size-4 place-items-center rounded-full bg-primary shadow-[0_0_12px_2px_var(--amber)] sm:left-auto ${
                    isRight ? 'sm:-left-2' : 'sm:-right-2'
                  }`}
                  aria-hidden="true"
                />
                <div
                  className={`glass w-full rounded-2xl p-6 ${isRight ? '' : 'sm:ml-auto'}`}
                >
                  <span className="font-mono text-xs tracking-widest text-primary">
                    {s.step} · {s.period}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
