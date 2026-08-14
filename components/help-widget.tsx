"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { RaiseQueryBox } from "./raise-query-box";

export function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Help"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-marigold text-ink shadow-lg transition hover:brightness-95"
      >
        <HelpCircle className="size-6" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-2 top-10 z-20 rounded-lg bg-surface p-1.5 text-muted transition hover:bg-paper hover:text-ink"
              >
                <X className="size-5" />
              </button>
              <RaiseQueryBox />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
