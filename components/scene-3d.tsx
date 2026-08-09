"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Scene3DInner = dynamic(() => import("./scene-3d-inner"), { ssr: false });

/**
 * Ambient 3D background layer. Only mounts the actual WebGL canvas when:
 *  - the browser doesn't prefer reduced motion, and
 *  - the section is actually in (or near) the viewport.
 * This keeps it from burning GPU/battery on sections the visitor never scrolls to.
 */
export function Scene3DBackground({
  variant = "network",
  className = "",
}: {
  variant?: "network" | "field";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShouldRender(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {shouldRender && !reducedMotion && <Scene3DInner variant={variant} />}
    </div>
  );
}
