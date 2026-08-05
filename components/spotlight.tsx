'use client'

import { useEffect, useRef } from 'react'

/**
 * A full-viewport, fixed mouse-following radial spotlight.
 * Uses direct DOM writes via rAF to avoid re-renders.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)')
    if (!media.matches) return

    let raf = 0
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 3 }

    function onMove(e: MouseEvent) {
      target.x = e.clientX
      target.y = e.clientY
    }

    function render() {
      const el = ref.current
      if (el) {
        el.style.background = `radial-gradient(600px circle at ${target.x}px ${target.y}px, color-mix(in oklch, var(--amber) 9%, transparent), transparent 70%)`
      }
      raf = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden md:block"
    />
  )
}
