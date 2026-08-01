"use client";

import { useEffect, useRef, useState } from "react";

type Spark = { id: number; x: number; y: number };

export function CursorTrail() {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const idRef = useRef(0);
  const lastSpawn = useRef(0);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSpawn.current < 45) return; // throttle spawn rate
      lastSpawn.current = now;

      const id = idRef.current++;
      setSparks((prev) => [...prev.slice(-14), { id, x: e.clientX, y: e.clientY }]);

      // Clean up this spark after its animation finishes
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== id));
      }, 700);
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {sparks.map((s) => (
        <span
          key={s.id}
          className="absolute h-1.5 w-1.5 rounded-full bg-ember-accent"
          style={{
            left: s.x,
            top: s.y,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 8px rgba(242,169,60,0.9)",
            animation: "spark-fade 0.7s ease-out forwards",
          }}
        />
      ))}
    </div>
  );
}
