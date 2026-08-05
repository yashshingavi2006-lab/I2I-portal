"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { EmberField } from "@/components/landing/ember-field";
import { Spotlight } from "@/components/spotlight";

export function PageShell({
  children,
  particles = true,
  className = "",
  theme = "ember",
}: {
  children: ReactNode;
  particles?: boolean;
  className?: string;
  theme?: "ember" | "v0";
}) {
  const themeClass = theme === "v0" ? "theme-v0" : "theme-ember";
  return (
    <div className={`${themeClass} relative min-h-screen bg-paper`}>
      {particles && theme === "ember" && <EmberField count={14} />}
      {theme === "v0" && (
        <>
          <div
            className="pointer-events-none absolute inset-0 grid-texture radial-fade opacity-40"
            aria-hidden="true"
          />
          <Spotlight />
        </>
      )}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
