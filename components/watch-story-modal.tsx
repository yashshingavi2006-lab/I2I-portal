"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, X } from "lucide-react";

function StoryModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-3xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-11 right-0 rounded-lg p-1.5 text-white/80 transition hover:text-white"
        >
          <X className="size-6" />
        </button>
        <video
          src="/videos/i2i-story-2026.mp4"
          controls
          autoPlay
          playsInline
          className="h-auto w-full rounded-2xl shadow-2xl"
        />
      </motion.div>
    </div>
  );
}

export function WatchStoryButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // A portal target — rendering the modal in-place would nest it inside
  // this section's animated (transformed) wrappers, and a transformed
  // ancestor turns `position: fixed` into "fixed to that ancestor" rather
  // than the viewport. That's what caused the backdrop to only cover part
  // of the page with the About cards bleeding through undimmed.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground transition hover:border-[color:color-mix(in_oklch,var(--amber)_45%,transparent)]"
      >
        <PlayCircle className="size-4 text-primary" />
        Watch Our Story
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && <StoryModal onClose={() => setOpen(false)} />}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
