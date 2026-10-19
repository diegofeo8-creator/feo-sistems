"use client";

import { useCallback, useEffect, useState } from "react";

type Photo = {
  id: number;
  url: string;
  alt: string | null;
};

interface Props {
  photos: Photo[];
  title: string;
}

export default function ProductGallery({ photos, title }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = photos.length;
  const current = photos[active] ?? null;

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setActive((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setActive((i) => (i + 1) % total);
  }, [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setLightbox(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (total === 0) {
    return (
      <div className="relative w-full max-w-[520px] aspect-[4/3] h-auto rounded-xl overflow-hidden bg-surface border border-border">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-muted text-sm">Sin imagen</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 sm:gap-4 items-start w-full">
        {/* Miniaturas verticales — un poco más grandes */}
        {total > 1 && (
          <div className="flex flex-col gap-2.5 shrink-0 w-16 sm:w-[4.5rem] max-h-[min(100%,28rem)] overflow-y-auto">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1}`}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                  i === active
                    ? "border-accent"
                    : "border-border hover:border-paper/40"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.alt ?? `${title} - foto ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Flecha izq. (afuera) + foto + flecha der. (afuera) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {total > 1 && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Foto anterior"
              className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-surface border border-border text-paper flex items-center justify-center hover:bg-accent hover:text-bg hover:border-accent transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Foto principal: proporción nativa, sin estirar altura */}
          <div className="relative flex-1 min-w-0 w-full max-w-[520px] aspect-[4/3] h-auto rounded-xl overflow-hidden bg-surface border border-border">
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="absolute inset-0 cursor-zoom-in flex items-center justify-center"
              aria-label="Ver imagen en grande"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current!.url}
                alt={current!.alt ?? title}
                className="w-full h-full object-contain"
              />
            </button>

            {total > 1 && (
              <span className="absolute bottom-2 right-2 z-10 text-[10px] font-heading bg-bg/80 text-paper px-2 py-0.5 rounded-sm border border-border pointer-events-none">
                {active + 1} / {total}
              </span>
            )}
          </div>

          {total > 1 && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Foto siguiente"
              className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-surface border border-border text-paper flex items-center justify-center hover:bg-accent hover:text-bg hover:border-accent transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox — fondo más transparente para seguir viendo la web */}
      {lightbox && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
          className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Foto anterior"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Foto siguiente"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.alt ?? title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {total > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-heading text-white/90 bg-black/50 px-3 py-1 rounded-full">
              {active + 1} / {total}
            </span>
          )}
        </div>
      )}
    </>
  );
}
