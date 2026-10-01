"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DragScrollRow from "@/components/servicios/DragScrollRow";

interface Review {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  timeAgo: string;
  text: string;
  fullText?: string;
  /** Link directo a la opinión en Google Maps (botón Compartir de cada reseña) */
  url: string;
}

// Datos reales del local en Google Maps (5.0 ★ · 12 opiniones)
// Ficha: https://maps.app.goo.gl/HtD2Q8CnPFMpSkrm6
const RATING = 5.0;
const TOTAL_REVIEWS = 12;
const GOOGLE_PLACE_URL = "https://maps.app.goo.gl/HtD2Q8CnPFMpSkrm6";

// Opiniones reales con link directo a cada reseña (orden: más recientes primero)
const REVIEWS: Review[] = [
  {
    id: "1",
    name: "Gonzalo Guareschi",
    initials: "GG",
    avatarColor: "#5B8DEF",
    rating: 5,
    timeAgo: "hace 1 mes",
    text: "Octavio un genio, en todo momento me mantuvo informado del trabajo. Termino el trabajo en el día más allá que se lo lleve un sábado por la tarde, súper recomendable y buen precio!",
    url: "https://maps.app.goo.gl/NCH19qst33EZc4xc9",
  },
  {
    id: "2",
    name: "Glenda Cardozo",
    initials: "GC",
    avatarColor: "#00A3A1",
    rating: 5,
    timeAgo: "hace 10 meses",
    text: "Un gran profesional, una persona con muchas ganas de trabajar y sobretodo honesto, trabaja súper bien en tiempo y forma! Super recomendable",
    url: "https://maps.app.goo.gl/RXjhYntnbqvcFqaE6",
  },
  {
    id: "3",
    name: "giuliana grilli",
    initials: "GG",
    avatarColor: "#E8A838",
    rating: 5,
    timeAgo: "hace 1 año",
    text: "Gran profesional, resolvió el problema con solvencia rápidamente. Octavio gran persona, agradecida con su atención. Muy confiable no dude en consultarlo.",
    url: "https://maps.app.goo.gl/GhSCMU3yE8wnfGbT7",
  },
  {
    id: "4",
    name: "kevin martinez",
    initials: "KM",
    avatarColor: "#C45C26",
    rating: 5,
    timeAgo: "hace 3 años",
    text: "Muy buen servicio y economico",
    url: "https://maps.app.goo.gl/Soz3oYAEFRzazzqu9",
  },
  {
    id: "5",
    name: "Susana tauzy",
    initials: "ST",
    avatarColor: "#7B6CF0",
    rating: 5,
    timeAgo: "hace 3 años",
    text: "Gran atención, responsabilidad y ganas de trabajar, un ejemplo !! Nos solucionó el problema rápido y a buen precio, con honestidad, no dude en llamarlo!!!",
    url: "https://maps.app.goo.gl/s9e4bVvLZtXRGZSZ6",
  },
  {
    id: "6",
    name: "Omar Almon",
    initials: "OA",
    avatarColor: "#2D8F5F",
    rating: 5,
    timeAgo: "hace 3 años",
    text: "Gran profesional, y gran persona, Siempre dispuesto, excelente atención",
    url: "https://maps.app.goo.gl/5b395q8xehiiz3f86",
  },
  {
    id: "7",
    name: "HALCON TACTICAL",
    initials: "HT",
    avatarColor: "#D94F4F",
    rating: 5,
    timeAgo: "hace 3 años",
    text: "Excelencia, rapidez, Octavio un genio!! gente con ganas de trabajar y honesto, raro en el rubro, Super recomendable!!",
    url: "https://maps.app.goo.gl/VewZFvRpnyszzTPRA",
  },
  {
    id: "8",
    name: "yulibeth López",
    initials: "YL",
    avatarColor: "#E07B39",
    rating: 5,
    timeAgo: "hace 5 años",
    text: "Buen servicio y responsabilidad.",
    url: "https://maps.app.goo.gl/Ng1YQSEYVvUWWHP19",
  },
  {
    id: "9",
    name: "Laura Burgos",
    initials: "LB",
    avatarColor: "#5B8DEF",
    rating: 5,
    timeAgo: "hace 6 años",
    text: "Excelente servicio, muy atento.",
    url: "https://maps.app.goo.gl/cCA7c89h7ouKUwJj8",
  },
  {
    id: "10",
    name: "Walter Santana",
    initials: "WS",
    avatarColor: "#00A3A1",
    rating: 5,
    timeAgo: "hace 6 años",
    text: "Excelente servicio, y gran atención! Definiitivamente lo recomiendo",
    url: "https://maps.app.goo.gl/9htvvVricr1rT7Sj7",
  },
  {
    id: "11",
    name: "Patricio González",
    initials: "PG",
    avatarColor: "#E8A838",
    rating: 5,
    timeAgo: "hace 6 años",
    text: "Muy confiable y una gran calidad humana la de Octavio. Lo recomiendo totalmente.",
    url: "https://maps.app.goo.gl/yWD1xpZkHpQMMd4U6",
  },
];

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.4 && rating - full < 1;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const starClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} filled className={starClass} />
      ))}
      {hasHalf && <Star half className={starClass} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className={starClass} />
      ))}
    </span>
  );
}

function Star({
  filled,
  half,
  className = "",
}: {
  filled?: boolean;
  half?: boolean;
  className?: string;
}) {
  if (half) {
    return (
      <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="#F4B400" />
            <stop offset="50%" stopColor="#4A4F55" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half-star)"
          d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.4l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"
        />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill={filled ? "#F4B400" : "#4A4F55"}
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.4l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"
      />
    </svg>
  );
}

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = review.text.length > 120;
  const displayText =
    expanded || !needsTruncate
      ? review.fullText ?? review.text
      : review.text.slice(0, 110).trimEnd() + "…";

  return (
    <a
      href={review.url}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      aria-label={`Ver opinión de ${review.name} en Google Maps`}
      className="group flex flex-col h-full min-w-0 bg-surface border border-border rounded-xl p-5
                 hover:border-accent hover:scale-[1.03] transition-all duration-250 ease-out cursor-pointer
                 origin-center will-change-transform
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
          style={{ backgroundColor: review.avatarColor }}
          aria-hidden="true"
        >
          {review.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-semibold text-paper text-sm truncate group-hover:text-accent transition-colors">
              {review.name}
            </span>
            <span
              className="shrink-0 w-3.5 h-3.5 rounded-full bg-[#4285F4] flex items-center justify-center"
              title="Perfil verificado en Google"
              aria-label="Verificado"
            >
              <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10.28 2.72a.75.75 0 010 1.06l-5 5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06L4.75 7.19l4.47-4.47a.75.75 0 011.06 0z" />
              </svg>
            </span>
          </div>
          <p className="text-muted text-xs mt-0.5 flex items-center gap-1">
            <span>{review.timeAgo}</span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              en <GoogleIcon className="w-3 h-3" />
              <span className="text-[#8AB4F8]">Google</span>
            </span>
          </p>
        </div>
      </div>

      <div className="mb-2">
        <Stars rating={review.rating} size="sm" />
      </div>

      <p className="text-paper/90 text-sm leading-relaxed flex-1">{displayText}</p>

      {needsTruncate && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="mt-2 self-start text-sm text-technical hover:text-accent transition-colors"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      )}

      <span className="mt-3 text-xs text-muted group-hover:text-accent transition-colors inline-flex items-center gap-1">
        Ver en Google Maps
        <svg
          className="w-3 h-3"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}

export default function ReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const getTrack = () =>
    trackRef.current?.querySelector(".drag-scroll-row") as HTMLElement | null;

  const getStep = (el: HTMLElement) => {
    const slide = el.querySelector("[data-review-slide]") as HTMLElement | null;
    if (!slide) return 300;
    const style = getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || "16") || 16;
    return slide.offsetWidth + gap;
  };

  const updateNav = useCallback(() => {
    const el = getTrack();
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const step = getStep(el);

    // Páginas reales = posiciones de scroll alcanzables (no 1 por tarjeta)
    const pages = maxScroll < 8 ? 1 : Math.floor(maxScroll / step) + 1;
    setPageCount(pages);

    setCanPrev(scrollLeft > 8);
    setCanNext(scrollLeft < maxScroll - 8);

    const page = step > 0 ? Math.round(scrollLeft / step) : 0;
    setActivePage(Math.min(Math.max(0, page), pages - 1));
  }, []);

  useEffect(() => {
    const el = getTrack();
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    // Recalcular tras layout (imágenes/fuentes)
    const ro = new ResizeObserver(() => updateNav());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", updateNav);
      ro.disconnect();
    };
  }, [updateNav]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = getTrack();
    if (!el) return;
    el.scrollBy({ left: dir * getStep(el), behavior: "smooth" });
  };

  const goToPage = (page: number) => {
    const el = getTrack();
    if (!el) return;
    const step = getStep(el);
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollTo({
      left: Math.min(page * step, maxScroll),
      behavior: "smooth",
    });
  };

  return (
    <section className="border-b border-border bg-bg" aria-labelledby="reviews-heading">
      {/* pt reducido: más pegado a Stats; sin border-top para no sumar aire */}
      <div className="max-w-6xl mx-auto px-6 pt-10 sm:pt-12 pb-8 sm:pb-10">
        <h2
          id="reviews-heading"
          className="font-heading font-bold text-paper text-2xl sm:text-3xl mb-6"
        >
          Lo que dicen nuestros clientes
        </h2>

        {/* Mismo borde izquierdo que el título y las tarjetas */}
        <div className="mb-8">
          <a
            href={GOOGLE_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-row items-center gap-3 sm:gap-4 rounded-2xl bg-surface border border-border px-5 sm:px-6 py-4 hover:border-accent/40 transition-colors"
          >
            <span className="font-heading font-bold text-paper text-4xl sm:text-5xl leading-none tracking-tight">
              {RATING.toFixed(1).replace(".", ",")}
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-semibold text-paper text-sm leading-tight">
                Opiniones de Google
              </span>
              <div className="flex items-center gap-1.5">
                <Stars rating={RATING} />
                <span className="text-muted text-xs">({TOTAL_REVIEWS})</span>
              </div>
            </div>
          </a>
        </div>

        {/*
          Título, rating y primera tarjeta comparten el mismo eje izquierdo (px-6 del contenedor).
          Las flechas se posicionan absolutas por fuera, sin empujar el carrusel.
        */}
        <div className="relative" ref={trackRef}>
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={!canPrev}
            aria-label="Opiniones anteriores"
            className="absolute left-0 top-1/2 z-10 -translate-x-[calc(100%+0.5rem)] -translate-y-1/2
                       w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface border border-border text-paper
                       flex items-center justify-center shadow-lg hover:border-accent/50
                       disabled:opacity-30 disabled:pointer-events-none transition-colors
                       max-sm:left-2 max-sm:translate-x-0 max-sm:bg-surface/95"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="overflow-hidden">
            <DragScrollRow className="!mx-0 !px-0">
              {REVIEWS.map((review) => (
                <div
                  key={review.id}
                  data-review-slide
                  className="shrink-0 w-[min(100%,260px)] sm:w-[280px] md:w-[300px] py-2"
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </DragScrollRow>
          </div>

          <button
            type="button"
            onClick={() => scrollByCards(1)}
            disabled={!canNext}
            aria-label="Opiniones siguientes"
            className="absolute right-0 top-1/2 z-10 translate-x-[calc(100%+0.5rem)] -translate-y-1/2
                       w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface border border-border text-paper
                       flex items-center justify-center shadow-lg hover:border-accent/50
                       disabled:opacity-30 disabled:pointer-events-none transition-colors
                       max-sm:right-2 max-sm:translate-x-0 max-sm:bg-surface/95"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Dots: solo tantas páginas como scroll real permita */}
        {pageCount > 1 && (
          <div
            className="flex justify-center gap-1.5 mt-6"
            role="tablist"
            aria-label="Páginas de opiniones"
          >
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activePage}
                aria-label={`Ir a página ${i + 1}`}
                onClick={() => goToPage(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === activePage ? "bg-accent" : "bg-border hover:bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        <p className="text-center mt-5">
          <a
            href={GOOGLE_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
          >
            <GoogleIcon className="w-4 h-4" />
            Ver todas las opiniones en Google
          </a>
        </p>
      </div>
    </section>
  );
}
