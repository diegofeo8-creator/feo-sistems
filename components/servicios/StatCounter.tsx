"use client";

import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  target: number;
  suffix?: string;
  label: string;
}

export default function StatCounter({ target, suffix = "", label }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        // Respeta a quienes prefieren menos movimiento: muestra el
        // número final directamente, sin animación de conteo.
        const prefersReduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReduced) {
          setValue(target);
          observer.disconnect();
          return;
        }

        const duration = 1200;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setValue(Math.round(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref}>
      <div className="font-heading font-bold text-accent text-4xl md:text-5xl">
        {value}
        {suffix}
      </div>
      <div className="text-muted text-sm mt-1">{label}</div>
    </div>
  );
}
