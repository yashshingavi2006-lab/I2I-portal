"use client";

import { motion } from "framer-motion";

const PHASES = [
  { n: "01", title: "Registration", desc: "Teams register their project idea and get a project code." },
  { n: "02", title: "Funding & Pitch", desc: "Shortlisted teams submit bills, pitch, and bank details." },
  { n: "03", title: "Mentorship", desc: "A mentor and ambassador are assigned to guide the project." },
  { n: "04", title: "Valedictory", desc: "Finalists present at COEP; winners are announced in April." },
];

export function PhaseJourney() {
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
          The Journey
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ember-text sm:text-4xl">
          Idea to impact, in four phases
        </h2>
      </motion.div>

      <div className="relative mx-auto mt-16 max-w-5xl">
        {/* connecting line — desktop: horizontal, mobile: vertical */}
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-ember-line sm:top-6 sm:left-0 sm:block sm:h-px sm:w-full sm:translate-x-0" />
        <motion.div
          className="absolute left-1/2 top-0 hidden w-px -translate-x-1/2 bg-ember-accent sm:top-6 sm:left-0 sm:block sm:h-px sm:translate-x-0"
          initial={{ height: 0, width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="grid gap-10 sm:grid-cols-4 sm:gap-6">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.18 }}
              className="relative flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.18 + 0.15,
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
                className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-ember-accent bg-ember-bg font-display text-sm font-bold text-ember-accent"
                style={{ boxShadow: "0 0 20px rgba(242,169,60,0.35)" }}
              >
                {p.n}
              </motion.div>
              <h3 className="mt-4 font-display text-base font-semibold text-ember-text">
                {p.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ember-muted">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
