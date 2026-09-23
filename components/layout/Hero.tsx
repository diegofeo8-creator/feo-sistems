"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

// El Canvas de Three.js solo puede correr en el navegador
const TechOrbitViewer = dynamic(
  () => import("@/components/hero/TechOrbitViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <span className="font-heading text-muted text-sm">Cargando modelo…</span>
      </div>
    ),
  }
);

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Foto de fondo del taller */}
      <Image
        src="/images/hero-header.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden="true"
      />

      {/* Veladura suave: deja ver la mesa y mantiene legible el texto */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-bg/75 via-bg/30 to-bg/40"
        aria-hidden="true"
      />

      {/* Contenido: texto izquierda + visor 3D derecha, grid 50/50 real */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 pt-28 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        {/* Columna de texto */}
        <div className="order-2 lg:order-1 self-end lg:self-center pb-4 lg:pb-0">
          <p
            className="font-heading text-accent font-semibold text-sm mb-4 animate-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            01 — ARCHIVO TÉCNICO
          </p>
          <h1
            className="font-heading font-bold text-paper text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.08] max-w-lg drop-shadow-sm animate-fade-up"
            style={{ animationDelay: "0.12s" }}
          >
            Servicio técnico especializado
          </h1>
          <p
            className="text-paper/85 mt-5 max-w-md text-sm md:text-base animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Diagnósticos reales, reportes fotográficos del proceso
            y garantía en cada reparación.
          </p>
          <div
            className="flex flex-wrap gap-3 mt-7 animate-fade-up"
            style={{ animationDelay: "0.28s" }}
          >
            <Link
              href="/Servicios"
              className="font-heading font-semibold text-sm bg-accent text-bg px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
            >
              Explorar los Servicios
            </Link>
            <Link
              href="/productos"
              className="font-heading font-semibold text-sm border border-paper/30 text-paper px-5 py-3 rounded-sm hover:border-paper/60 transition-colors backdrop-blur-sm bg-bg/20"
            >
              Ver productos
            </Link>
          </div>

          {/* Stats compactos bajo el texto en desktop */}
          <div
            className="hidden lg:flex gap-10 mt-10 pt-6 border-t border-paper/15 animate-fade-up"
            style={{ animationDelay: "0.36s" }}
          >
            <div>
              <div className="font-heading font-bold text-accent text-3xl">20+</div>
              <div className="text-paper/70 text-xs mt-0.5">Casos documentados</div>
            </div>
            <div>
              <div className="font-heading font-bold text-accent text-3xl">10</div>
              <div className="text-paper/70 text-xs mt-0.5">productos y servicios</div>
            </div>
          </div>
        </div>

        {/* Visor 3D interactivo */}
        <div
          className="order-1 lg:order-2 relative h-[30vh] max-h-[280px] min-h-[220px] sm:h-[34vh] sm:max-h-[320px] lg:h-[42vh] lg:max-h-[400px] lg:min-h-[320px] overflow-hidden rounded-sm animate-fade-up"
          style={{ animationDelay: "0.25s" }}
        >
          <TechOrbitViewer />
        </div>
      </div>
    </section>
  );
}
