import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import CaseCard from "@/components/servicios/CaseCard";
import { getProductoConServicios, getArticulosByCategoryId } from "@/lib/queries"; // 👈 Importamos su nueva query del Paso 2

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductoConServicios(slug);
  if (!data) return {};

  return {
    title: data.producto.name,
    description: data.producto.description ?? undefined,
    alternates: { canonical: `/productos/${slug}` },
  };
}

export default async function ProductoDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // 1. Obtenemos los datos originales de la categoría y sus servicios técnicos
  const data = await getProductoConServicios(slug);
  if (!data) notFound();

  const { producto, servicios } = data;

  // 2. Traemos de Supabase los artículos en venta vinculados a este UUID de categoría (Máx 32 publicados)
  const articulos = await getArticulosByCategoryId(producto.id);

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <Link href="/productos" className="font-heading text-xs text-muted hover:text-accent transition-colors">
        ← PRODUCTOS
      </Link>

      <header className="mt-4 mb-10 flex flex-col md:flex-row gap-8 items-start">
        {producto.image && (
          <div className="relative w-full md:w-64 h-40 shrink-0 rounded-xl overflow-hidden bg-surface border border-border">
            <Image src={producto.image} alt={producto.name} fill sizes="256px" className="object-cover" />
          </div>
        )}
        <div>
          <h1 className="font-heading font-bold text-paper text-4xl md:text-5xl">{producto.name}</h1>
          {producto.description && <p className="text-muted mt-4 max-w-xl">{producto.description}</p>}
        </div>
      </header>

      {/* 🚀 UBICACIÓN EXACTA DE LAS FLECHAS ROJAS: Grilla de artículos en venta */}
      <section className="mb-16">
        <h2 className="font-heading font-bold text-accent text-xl mb-6">// Catálogo disponible en tienda ({articulos.length})</h2>
        
        {articulos.length === 0 ? (
          <p className="font-heading text-paper/60 bg-surface/30 border border-border/50 rounded-sm px-6 py-6 text-sm">
            No hay stock disponible en esta categoría momentáneamente. Consúltanos por ingresos específicos.
          </p>
        ) : (
          /* Grilla responsiva de 4 columnas horizontales idéntica a la referencia de Mercado Libre */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {articulos.map((art) => (
              <div 
                key={art.id} 
                className="bg-surface border border-border rounded-sm p-4 flex flex-col justify-between hover:border-accent/40 transition-colors"
              >
                <div>
                  <div className="aspect-square bg-bg rounded-sm mb-4 overflow-hidden flex items-center justify-center border border-border/40 relative">
                    {art.cover_image ? (
                      <img src={art.cover_image} alt={art.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted">Sin imagen</span>
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-paper text-sm mb-1 line-clamp-1">{art.title}</h3>
                  <p className="text-xs text-muted mb-4 line-clamp-2 h-8">{art.description || "Sin descripción disponible."}</p>
                </div>
                <div>
                  <p className="text-accent font-heading font-bold text-base mb-3">
                    {art.price ? `$ ${art.price}` : "Consultar precio"}
                  </p>
                  <a
                    href={`https://wa.me{encodeURIComponent(art.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center font-heading text-xs font-bold bg-paper text-bg py-2 rounded-sm hover:bg-accent transition-colors"
                  >
                    Consultar stock
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bloque Inferior: Servicios técnicos relacionados con el producto (Se mantiene intacto) */}
      <h2 className="font-heading font-bold text-paper text-2xl mb-6 border-t border-border/40 pt-10">
        Servicios relacionados con {producto.name}
      </h2>

      {servicios.length === 0 ? (
        <p className="font-heading text-paper/80 border border-border rounded-sm px-6 py-10 text-center">
          TODAVÍA NO HAY SERVICIOS PUBLICADOS PARA ESTE PRODUCTO.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicios.map((s) => (
            <CaseCard key={s.slug} {...s} />
          ))}
        </div>
      )}
    </div>
  );
}
