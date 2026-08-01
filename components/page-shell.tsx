"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { EmberField } from "@/components/landing/ember-field";

export function PageShell({
  children,
  particles = true,
  className = "",
}: {
  children: ReactNode;
  particles?: boolean;
  className?: string;
}) {
  return (
    <div className={`theme-ember relative min-h-screen bg-paper ${className}`}>
      {particles && <EmberField count={14} />}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
