import type { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import IntroSection from "@/components/layout/IntroSection";
import ProductosSection from "@/components/layout/CategoriesSection";
import LibraryPreviewSection from "@/components/layout/LibraryPreviewSection";
import StatsSection from "@/components/layout/StatsSection";
import ReviewsSection from "@/components/layout/ReviewsSection";
import SocialSection from "@/components/layout/SocialSection";
import MapSection from "@/components/layout/MapSection";
import { getHomeproductos, getFeaturedservicios } from "@/lib/queries";

export const revalidate = 60; // segundos

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [productos, featuredservicios] = await Promise.all([
    getHomeproductos(),
    getFeaturedservicios(6),
  ]);

  // Home: solo 8 productos (2 filas × 4). El resto en /productos.
  const productosHome = productos.slice(0, 8);
  const totalCount = productos.reduce((sum, c) => sum + c.caseCount, 0);

  return (
    <>
      <Hero />
      <IntroSection />

      {/* Cuadrícula técnica: arranca acá (después del bloque de texto
          principal) y cubre las secciones de productos/casos. El
          fondo queda encapsulado en este div, no en <body> ni global. */}
      <div className="bg-technical-grid">
        <ProductosSection productos={productosHome} showMoreLink />
        <LibraryPreviewSection servicios={featuredservicios} totalCount={totalCount} />
      </div>

      <ReviewsSection />
      <StatsSection />
      <MapSection />
      <SocialSection />
    </>
  );
}
