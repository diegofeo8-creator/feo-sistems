import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import CaseCard from "@/components/servicios/CaseCard";
import { getProductoConServicios, getArticulosByCategoryId } from "@/lib/queries";

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

  const data = await getProductoConServicios(slug);
  if (!data) notFound();

  const { producto, servicios } = data;
  const articulos = await getArticulosByCategoryId(producto.id);

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <Link
        href="/productos"
        className="font-heading text-xs text-muted hover:text-accent transition-colors"
      >
        ← PRODUCTOS
      </Link>

      <header className="mt-4 mb-10 flex flex-col md:flex-row gap-8 items-start">
        {producto.image && (
          <div className="relative w-full md:w-64 h-40 shrink-0 rounded-xl overflow-hidden bg-surface border border-border">
            <Image
              src={producto.image}
              alt={producto.name}
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="font-heading font-bold text-paper text-4xl md:text-5xl">
            {producto.name}
          </h1>
          {producto.description && (
            <p className="text-muted mt-4 max-w-xl">{producto.description}</p>
          )}
        </div>
      </header>

      {/* Catálogo disponible en tienda */}
      <section className="mb-16">
        <h2 className="font-heading font-bold text-accent text-xl mb-6">
          // Catálogo disponible en tienda ({articulos.length})
        </h2>

        {articulos.length === 0 ? (
          <p className="font-heading text-paper/60 bg-surface/30 border border-border/50 rounded-sm px-6 py-6 text-sm">
            No hay stock disponible en esta categoría momentáneamente. Consúltanos
            por ingresos específicos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {articulos.map((art) => (
              <Link
                key={art.id}
                href={`/catalogo/${art.slug}`}
                className="group flex h-full flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-colors"
              >
                {/* Imagen full-bleed arriba (estilo Mercado Libre) */}
                <div className="relative aspect-square shrink-0 bg-border overflow-hidden">
                  {art.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.cover_image}
                      alt={art.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface">
                      <span className="font-heading text-muted text-xs tracking-wide">
                        Sin imagen
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-heading font-semibold text-paper text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2 flex-1">
                    {art.description || "Sin descripción disponible."}
                  </p>
                  <p className="text-accent font-heading font-bold text-base mt-3">
                    {art.price ? `$ ${art.price}` : "Consultar precio"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Servicios técnicos relacionados */}
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
