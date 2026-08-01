"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SECTORS } from "@/lib/constants";
import { SpotlightCard } from "@/components/spotlight-card";

const PORTALS = [
  {
    title: "Secretary",
    desc: "Master access — manage all registrations, phases, assignments, and funding.",
    href: "/login?portal=secretary",
  },
  {
    title: "Participants",
    desc: "Team leaders — track your project's progress through each phase.",
    href: "/login?portal=participant",
  },
  {
    title: "Ambassadors",
    desc: "Chief ambassadors & ambassadors — view your assigned projects.",
    href: "/login?portal=ambassador",
  },
  {
    title: "Mentors",
    desc: "Eaton mentors — view and guide your assigned projects.",
    href: "/login?portal=mentor",
  },
];

export function PortalSection() {
  return (
    <section id="portals" className="relative px-4 py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-accent">
          Portals
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ember-text sm:text-4xl">
          One platform, three journeys
        </h2>
      </motion.div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PORTALS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <SpotlightCard className="h-full rounded-2xl border border-ember-line bg-ember-bg-elevated transition-all duration-300 hover:-translate-y-1.5 hover:border-ember-accent/50">
              <Link href={p.href} className="group block h-full p-7">
                <p className="relative font-display text-lg font-semibold text-ember-text">
                  {p.title}
                </p>
                <p className="relative mt-2.5 text-sm leading-relaxed text-ember-muted">
                  {p.desc}
                </p>
                <p className="relative mt-5 flex items-center gap-1.5 text-sm font-medium text-ember-accent">
                  Log in
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </Link>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mx-auto mt-16 max-w-4xl"
      >
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-ember-muted">
          Sectors
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {SECTORS.map((s) => (
            <span
              key={s.prefix}
              className="rounded-full border border-ember-line px-4 py-1.5 text-xs font-medium text-ember-muted transition hover:border-ember-accent/50 hover:text-ember-accent"
            >
              {s.label}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
