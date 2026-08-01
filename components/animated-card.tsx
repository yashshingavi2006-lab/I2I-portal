"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function AnimatedCard({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border border-line bg-surface p-6 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
