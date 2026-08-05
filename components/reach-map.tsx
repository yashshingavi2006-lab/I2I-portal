'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type Region = {
  id: string
  x: number
  y: number
  name: string
  meta: string
  isHub?: boolean
}

// Approximate relative positions on the stylized outline below — not precise
// district centroids, just proportioned/oriented from real geography (Konkan
// coast west, Vidarbha's arm northeast, Western Maharashtra running south).
const HUB: Region = { id: 'pune', x: 250, y: 300, name: 'Pune Region', meta: 'I2I / Bhau Institute HQ', isHub: true }

const REGIONS: Region[] = [
  { id: 'mumbai', x: 105, y: 245, name: 'Mumbai', meta: 'Financial capital' },
  { id: 'nashik', x: 175, y: 150, name: 'Nashik', meta: 'College reconnection' },
  { id: 'nagar', x: 245, y: 220, name: 'Ahmednagar (Nagar)', meta: 'College reconnection' },
  HUB,
  { id: 'satara', x: 220, y: 350, name: 'Satara', meta: 'Statewide publicity' },
  { id: 'sangli', x: 195, y: 400, name: 'Sangli', meta: 'Statewide publicity' },
  { id: 'kolhapur', x: 175, y: 435, name: 'Kolhapur', meta: 'Statewide publicity' },
  { id: 'solapur', x: 280, y: 400, name: 'Solapur', meta: 'Regional outreach' },
  { id: 'marathwada', x: 330, y: 330, name: 'Marathwada', meta: 'Regional publicity drive' },
  { id: 'aurangabad', x: 315, y: 255, name: 'Chh. Sambhajinagar', meta: "Marathwada's hub city" },
  { id: 'amravati', x: 390, y: 165, name: 'Amravati', meta: 'College reconnection' },
  { id: 'nagpur', x: 445, y: 200, name: 'Nagpur', meta: 'College reconnection' },
]

// Simplified stylized Maharashtra outline — proportioned/oriented from real
// geography, not a precise geodetic trace.
const OUTLINE = `
  M 150 40
  L 210 35 L 260 50 L 300 45
  L 340 60 L 400 55 L 440 70
  L 480 90 L 495 130 L 470 165
  L 490 195 L 480 235 L 455 250
  L 460 285 L 430 300 L 400 290
  L 390 320 L 355 335 L 330 365
  L 300 380 L 275 410 L 245 430
  L 220 460 L 190 470 L 165 450
  L 140 460 L 110 440 L 95 405
  L 105 370 L 85 340 L 90 305
  L 65 275 L 75 240 L 60 205
  L 80 175 L 70 140 L 95 110
  L 90 75 L 120 55
  Z
`

function routePath(r: Region) {
  const mx = (HUB.x + r.x) / 2 + (r.y - HUB.y) * 0.12
  const my = (HUB.y + r.y) / 2 - (r.x - HUB.x) * 0.12
  return `M ${HUB.x} ${HUB.y} Q ${mx} ${my} ${r.x} ${r.y}`
}

export function ReachMap({ compact = false }: { compact?: boolean }) {
  const [hover, setHover] = useState<string | null>(null)
  const active = REGIONS.find((r) => r.id === hover) ?? null

  const map = (
    <div className="relative h-full w-full">
        <svg
          viewBox="0 0 520 560"
          role="img"
          aria-label="Map of Maharashtra highlighting twelve outreach regions"
          className="h-full w-full"
        >
          <path
            d={OUTLINE}
            fill="color-mix(in oklch, var(--amber) 5%, transparent)"
            stroke="color-mix(in oklch, var(--amber) 45%, transparent)"
            strokeWidth={1.4}
          />

          {REGIONS.filter((r) => !r.isHub).map((r) => (
            <path
              key={`route-${r.id}`}
              d={routePath(r)}
              fill="none"
              stroke="var(--amber)"
              strokeWidth={1}
              strokeDasharray="3 4"
              opacity={hover === r.id ? 0.7 : 0.32}
              className="transition-opacity duration-200"
            />
          ))}

          {REGIONS.map((r) => (
            <g
              key={r.id}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              <motion.circle
                cx={r.x}
                cy={r.y}
                r={6}
                fill="none"
                stroke="var(--amber)"
                strokeWidth={1.1}
                initial={{ r: 6, opacity: 0.55 }}
                animate={{ r: [6, 22], opacity: [0.55, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: (r.x % 7) * 0.2 }}
              />
              <circle
                cx={r.x}
                cy={r.y}
                r={r.isHub ? 6 : 4.5}
                fill={r.isHub ? 'var(--amber-soft)' : 'var(--amber)'}
                style={{ filter: 'drop-shadow(0 0 6px color-mix(in oklch, var(--amber) 80%, transparent))' }}
              />
              <text
                x={r.x + (r.x > 350 ? -8 : 8)}
                y={r.y - 9}
                textAnchor={r.x > 350 ? 'end' : 'start'}
                className="fill-foreground font-mono text-[9.5px] tracking-wide"
              >
                {r.name}
              </text>
            </g>
          ))}
        </svg>

        {active && (
          <div
            className="glass-strong pointer-events-none absolute max-w-[220px] -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl px-3.5 py-2.5"
            style={{ left: `${(active.x / 520) * 100}%`, top: `${(active.y / 560) * 100}%` }}
          >
            <p className="font-display text-sm font-bold leading-tight">{active.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{active.meta}</p>
          </div>
        )}
    </div>
  )

  if (compact) return map

  return (
    <div className="relative">
      <div
        className="glass relative overflow-hidden rounded-3xl p-5"
        style={{
          background:
            'radial-gradient(560px circle at 68% 20%, color-mix(in oklch, var(--amber) 8%, transparent), transparent 70%)',
        }}
      >
        {map}
      </div>

      <p className="mt-3 text-center font-mono text-[10.5px] text-muted-foreground opacity-70">
        Stylized outline — proportioned from real geography, not a precise trace. Hover a pin for detail.
      </p>
    </div>
  )
}
