"use client";

import { useRef, useEffect, type ReactNode } from "react";

interface DragScrollRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Carrusel horizontal con arrastre + inercia.
 * - Click en tarjeta → navega (no interfiere con <Link>)
 * - Arrastre > 15px → scroll + inercia al soltar; el click se cancela solo entonces
 */
export default function DragScrollRow({ children, className = "" }: DragScrollRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let dragged = false;
    let startX = 0;
    let scrollStart = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let rafId: number | null = null;
    let suppressClickHandler: ((ev: MouseEvent) => void) | null = null;

    const stopInertia = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const startInertia = () => {
      let v = velocity * 16 * 1.15;
      if (Math.abs(v) < 2) return;
      v = Math.max(-48, Math.min(48, v));
      const friction = 0.92;

      const tick = () => {
        v *= friction;
        if (Math.abs(v) < 0.4) {
          rafId = null;
          return;
        }
        el.scrollLeft -= v;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft <= 0 || el.scrollLeft >= maxScroll - 0.5) {
          rafId = null;
          return;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const clearSuppress = () => {
      if (suppressClickHandler) {
        el.removeEventListener("click", suppressClickHandler, true);
        suppressClickHandler = null;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stopInertia();
      clearSuppress();
      down = true;
      dragged = false;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      // NO setPointerCapture acá: si no, el <Link> no recibe el click.
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      const now = performance.now();

      if (!dragged) {
        if (Math.abs(dx) < 15) return;
        dragged = true;
        el.dataset.dragging = "true";
        // A partir de acá sí capturamos para no perder el gesto
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }

      el.scrollLeft = scrollStart - dx;

      const dt = now - lastT;
      if (dt > 0) {
        const inst = (e.clientX - lastX) / dt;
        velocity = velocity * 0.7 + inst * 0.3;
      }
      lastX = e.clientX;
      lastT = now;
      e.preventDefault();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      delete el.dataset.dragging;

      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      if (dragged) {
        startInertia();
        // Cancelar SOLO el click inmediato posterior al arrastre
        suppressClickHandler = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
          clearSuppress();
        };
        el.addEventListener("click", suppressClickHandler, true);
        window.setTimeout(clearSuppress, 120);
      }
      dragged = false;
    };

    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("dragstart", onDragStart, true);

    return () => {
      stopInertia();
      clearSuppress();
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("dragstart", onDragStart, true);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`drag-scroll-row flex gap-4 overflow-x-auto pb-1 -mx-6 px-6 md:mx-0 md:px-0 select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        touchAction: "pan-y",
      }}
    >
      {children}
      <style>{`
        .drag-scroll-row::-webkit-scrollbar { display: none; }
        .drag-scroll-row[data-dragging="true"] { cursor: grabbing; }
      `}</style>
    </div>
  );
}
