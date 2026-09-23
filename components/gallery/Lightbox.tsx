"use client";

import { useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useFocusTrap } from "@/lib/useFocusTrap";

interface LightboxProps {
  images: { url: string; alt: string; caption: string }[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const goNext = useCallback(
    () => onNavigate((index + 1) % images.length),
    [index, images.length, onNavigate]
  );
  const goPrev = useCallback(
    () => onNavigate((index - 1 + images.length) % images.length),
    [index, images.length, onNavigate]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  // Mantiene el foco dentro del lightbox mientras está abierto (para que
  // Tab no escape hacia la página de fondo) y lo devuelve a la miniatura
  // que lo abrió al cerrarlo. El foco inicial va al botón "Cerrar".
  useFocusTrap(true, containerRef, closeButtonRef);

  const current = images[index];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] bg-bg/97 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de imágenes"
      onClick={onClose}
    >
      {/* Anuncia a lectores de pantalla qué imagen se está viendo cada
          vez que cambia, sin necesidad de reabrir el diálogo. */}
      <p className="sr-only" aria-live="polite">
        Imagen {index + 1} de {images.length}: {current.alt}
      </p>

      <div className="flex items-center justify-between px-6 h-16 text-paper" onClick={(e) => e.stopPropagation()}>
        <span className="font-heading text-sm text-muted" aria-hidden="true">
          {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
        <button ref={closeButtonRef} aria-label="Cerrar galería" onClick={onClose} className="text-paper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Esta fila NO detiene la propagación del clic: hacer clic en el
          espacio vacío alrededor de la foto (a los costados, arriba,
          abajo) cierra el lightbox. Solo la foto y los botones de
          navegación, más abajo, detienen la propagación. */}
      <div className="flex-1 flex items-center justify-center px-4 gap-4 min-h-0">
        <button
          aria-label="Imagen anterior"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="hidden sm:flex text-paper/70 hover:text-accent shrink-0"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          className="relative max-w-3xl w-full aspect-[4/3] bg-surface border border-border rounded-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={current.url}
            alt={current.alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
            priority
          />
        </div>

        <button
          aria-label="Imagen siguiente"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="hidden sm:flex text-paper/70 hover:text-accent shrink-0"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {current.caption && (
        <p className="text-center text-muted text-sm px-6 pb-8" onClick={(e) => e.stopPropagation()}>
          {current.caption}
        </p>
      )}
    </div>
  );
}
