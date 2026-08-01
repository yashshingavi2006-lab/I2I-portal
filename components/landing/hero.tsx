"use client";

import { motion, type Variants } from "framer-motion";
import { EmberField } from "./ember-field";
import { MagneticButton } from "@/components/magnetic-button";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Ambient glow behind headline */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--ember-accent) 0%, transparent 70%)" }}
      />
      <EmberField />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center"
      >
        <motion.p
          variants={item}
          className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-accent"
        >
          Bhau Institute · COEP Technological University
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-5 font-display text-5xl font-bold leading-[1.05] text-ember-text sm:text-7xl"
        >
          Ignited Innovators
          <br />
          <span className="text-ember-accent">of India</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-base text-ember-muted sm:text-lg"
        >
          Where student ideas become social impact. Registrations for
          2026-27 are now open.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap justify-center gap-3">
          <MagneticButton
            href="/register"
            strength={0.4}
            className="group relative inline-block overflow-hidden rounded-full bg-ember-accent px-8 py-3.5 text-sm font-semibold text-ember-bg transition"
          >
            <span className="relative z-10">Register your project</span>
            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0" />
          </MagneticButton>
          <a
            href="#portals"
            className="rounded-full border border-ember-line px-8 py-3.5 text-sm font-semibold text-ember-text transition hover:border-ember-accent hover:text-ember-accent"
          >
            Explore portals
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-ember-muted"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="h-6 w-px bg-ember-muted"
        />
      </motion.div>
    </section>
  );
}
