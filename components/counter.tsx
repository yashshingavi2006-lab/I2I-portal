'use client'

import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

export function Counter({
  to,
  suffix = '',
  prefix = '',
  duration = 2,
}: {
  to: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!inView) return
    const node = ref.current
    if (!node) return

    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        node.textContent = `${prefix}${Math.round(value).toLocaleString()}${suffix}`
      },
    })

    return () => controls.stop()
  }, [inView, to, suffix, prefix, duration])

  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  )
}
