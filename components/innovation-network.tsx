'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

type Node = {
  id: number
  x: number
  y: number
  r: number
  label?: string
}

const NODES: Node[] = [
  { id: 0, x: 300, y: 200, r: 10, label: 'I2I' },
  { id: 1, x: 140, y: 110, r: 6 },
  { id: 2, x: 470, y: 120, r: 7 },
  { id: 3, x: 90, y: 280, r: 5 },
  { id: 4, x: 500, y: 300, r: 6 },
  { id: 5, x: 250, y: 60, r: 5 },
  { id: 6, x: 380, y: 330, r: 5 },
  { id: 7, x: 200, y: 340, r: 4 },
  { id: 8, x: 560, y: 210, r: 4 },
  { id: 9, x: 40, y: 180, r: 4 },
  { id: 10, x: 420, y: 60, r: 4 },
]

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [0, 7],
  [1, 5],
  [1, 9],
  [2, 10],
  [2, 8],
  [4, 8],
  [4, 6],
  [3, 7],
  [3, 9],
]

export function InnovationNetwork() {
  const [hover, setHover] = useState<number | null>(null)

  const paths = useMemo(
    () =>
      EDGES.map(([a, b], i) => {
        const na = NODES[a]
        const nb = NODES[b]
        return { i, a, b, x1: na.x, y1: na.y, x2: nb.x, y2: nb.y }
      }),
    [],
  )

  return (
    <svg
      viewBox="0 0 600 400"
      className="h-full w-full"
      fill="none"
      role="img"
      aria-label="Animated network of student innovators connecting to the I2I hub"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.05" />
          <stop offset="50%" stopColor="var(--amber)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {paths.map((p) => {
        const active = hover === p.a || hover === p.b
        return (
          <motion.line
            key={p.i}
            x1={p.x1}
            y1={p.y1}
            x2={p.x2}
            y2={p.y2}
            stroke="url(#edgeGrad)"
            strokeWidth={active ? 1.6 : 0.8}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: p.i * 0.06, ease: 'easeInOut' }}
            style={{ opacity: active ? 1 : 0.6 }}
          />
        )
      })}

      {/* traveling pulses along a few edges */}
      {paths.slice(0, 6).map((p) => (
        <motion.circle
          key={`pulse-${p.i}`}
          r={1.8}
          fill="var(--amber-soft)"
          initial={{ cx: p.x1, cy: p.y1, opacity: 0 }}
          animate={{
            cx: [p.x1, p.x2],
            cy: [p.y1, p.y2],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.4,
            delay: p.i * 0.5,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {NODES.map((n) => {
        const isHub = n.id === 0
        return (
          <g
            key={n.id}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            className="cursor-pointer"
          >
            <circle cx={n.x} cy={n.y} r={n.r * 3.5} fill="url(#nodeGlow)" opacity={isHub ? 0.5 : 0.25} />
            <motion.circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={isHub ? 'var(--amber)' : 'var(--background)'}
              stroke="var(--amber)"
              strokeWidth={isHub ? 0 : 1.4}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + n.id * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            />
            {isHub && (
              <>
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill="none"
                  stroke="var(--amber)"
                  strokeWidth={1}
                  animate={{ r: [n.r, n.r * 4], opacity: [0.6, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
                />
                <text
                  x={n.x}
                  y={n.y + 26}
                  textAnchor="middle"
                  className="fill-foreground font-mono text-[10px] uppercase tracking-widest"
                >
                  Hub
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
