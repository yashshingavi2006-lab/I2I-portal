import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/motion-primitives'

export function Section({
  id,
  children,
  className,
}: {
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={cn('relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 md:py-32', className)}
    >
      {children}
    </section>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
      <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_var(--amber)]" />
      {children}
    </span>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        align === 'center' && 'items-center text-center',
      )}
    >
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="max-w-3xl text-balance font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              'max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg',
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}
