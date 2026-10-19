import type { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import IntroSection from "@/components/layout/IntroSection";
import LibraryPreviewSection from "@/components/layout/LibraryPreviewSection";
import StatsSection from "@/components/layout/StatsSection";
import ReviewsSection from "@/components/layout/ReviewsSection";
import SocialSection from "@/components/layout/SocialSection";
import MapSection from "@/components/layout/MapSection";
import { getHomeproductos, getFeaturedservicios, getHomeArticulos } from "@/lib/queries";
import ArticuloCard from "@/components/productos/ArticuloCard";
import Link from "next/link";

export const revalidate = 60; // segundos

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [productos, featuredservicios, articulosHome] = await Promise.all([
    getHomeproductos(),
    getFeaturedservicios(6),
    getHomeArticulos(8),
  ]);

  const totalCount = productos.reduce((sum, c) => sum + c.caseCount, 0);

  return (
    <>
      <Hero />
      <IntroSection />

      {/* Cuadrícula técnica: arranca acá (después del bloque de texto
          principal) y cubre las secciones de productos/casos. El
          fondo queda encapsulado en este div, no en <body> ni global. */}
      <div className="bg-technical-grid">
        {/* Productos: solo Software + Unidades de almacenamiento, máx 8 (2×4) */}
        <section className="max-w-6xl mx-auto px-6 pt-3xl pb-6">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-heading font-bold text-paper text-3xl">Productos</h2>
          </div>

          {articulosHome.length === 0 ? (
            <p className="font-heading text-paper/80 border border-border rounded-sm px-6 py-10 text-center">
              Todavía no hay productos de Software o Unidades de almacenamiento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {articulosHome.map((art) => (
                <ArticuloCard
                  key={art.id}
                  id={art.id}
                  title={art.title}
                  slug={art.slug}
                  description={art.description}
                  price={art.price}
                  cover_image={art.cover_image}
                />
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              href="/productos"
              className="group inline-flex items-center gap-2 font-heading text-sm font-semibold tracking-wide text-bg bg-accent px-6 py-3 rounded-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Ver más productos
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </section>

        <LibraryPreviewSection servicios={featuredservicios} totalCount={totalCount} />
      </div>

      <ReviewsSection />
      <StatsSection />
      <MapSection />
      <SocialSection />
    </>
  );
}
