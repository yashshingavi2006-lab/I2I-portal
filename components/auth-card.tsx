"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <PageShell className="flex flex-1 items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-marigold">
            I2I Portal
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          {children}
        </div>
      </motion.div>
    </PageShell>
  );
}
