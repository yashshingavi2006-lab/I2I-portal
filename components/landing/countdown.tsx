"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REGISTRATION_DEADLINE } from "@/lib/constants";

function getTimeLeft() {
  const diff = Math.max(0, REGISTRATION_DEADLINE.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function DigitBlock({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-ember-line bg-ember-bg-elevated sm:h-20 sm:w-20">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={padded}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-ember-accent sm:text-3xl"
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[10px] font-medium uppercase tracking-widest text-ember-muted">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Avoid SSR/CSR mismatch — render nothing until mounted on the client.
  if (!time) return <div className="h-[104px] sm:h-[120px]" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-accent">
        Registrations close in
      </p>
      <div className="mt-5 flex gap-3 sm:gap-4">
        <DigitBlock value={time.days} label="Days" />
        <DigitBlock value={time.hours} label="Hours" />
        <DigitBlock value={time.minutes} label="Min" />
        <DigitBlock value={time.seconds} label="Sec" />
      </div>
    </motion.div>
  );
}
