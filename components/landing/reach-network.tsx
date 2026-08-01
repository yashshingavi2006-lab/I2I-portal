"use client";

import { motion } from "framer-motion";

// SAMPLE DATA — replace with real participating colleges once you have the
// list (city + rough relative position on the card, x/y as percentages).
// COEP is the hub; every other node connects back to it.
const NODES = [
  { name: "COEP, Pune", x: 50, y: 50, hub: true },
  { name: "Mumbai", x: 22, y: 30 },
  { name: "Nagpur", x: 82, y: 22 },
  { name: "Nashik", x: 30, y: 65 },
  { name: "Aurangabad", x: 68, y: 68 },
  { name: "Kolhapur", x: 15, y: 78 },
];

export function ReachNetwork() {
  return (
    <section className="relative px-4 py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-accent">
          Reach
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ember-text sm:text-4xl">
          A growing network of colleges
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ember-muted">
          Sample network shown below — replace with real participating colleges once you have the list.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-14 h-[340px] max-w-3xl rounded-3xl border border-ember-line bg-ember-bg-elevated sm:h-[420px]"
      >
        {/* faint dot-grid backdrop for texture */}
        <div
          className="absolute inset-0 rounded-3xl opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--ember-muted) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {NODES.filter((n) => !n.hub).map((n, i) => {
            const hub = NODES[0];
            return (
              <motion.line
                key={n.name}
                x1={`${hub.x}%`}
                y1={`${hub.y}%`}
                x2={`${n.x}%`}
                y2={`${n.y}%`}
                stroke="var(--ember-accent)"
                strokeWidth="1"
                strokeOpacity="0.25"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
              />
            );
          })}
        </svg>

        {NODES.map((n, i) => (
          <motion.div
            key={n.name}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: n.hub ? 0.1 : 0.4 + i * 0.1,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              <span
                className={`block rounded-full ${
                  n.hub
                    ? "h-3.5 w-3.5 bg-ember-accent"
                    : "h-2.5 w-2.5 bg-ember-accent/70"
                }`}
                style={{
                  boxShadow: n.hub
                    ? "0 0 0 6px rgba(242,169,60,0.15), 0 0 20px rgba(242,169,60,0.5)"
                    : "0 0 12px rgba(242,169,60,0.35)",
                }}
              />
              <span
                className={`mt-2 whitespace-nowrap rounded-full border border-ember-line bg-ember-bg px-2.5 py-1 text-[11px] font-medium ${
                  n.hub ? "text-ember-accent" : "text-ember-muted"
                }`}
              >
                {n.name}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
