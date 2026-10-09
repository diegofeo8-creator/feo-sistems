import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticuloBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articulos_categoria")
    .select(
      `
      id,
      title,
      slug,
      description,
      price,
      cover_image,
      published,
      category_id,
      productos ( id, name, slug ),
      articulos_media ( id, url, alt, order )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const art = await getArticuloBySlug(slug);
  if (!art) return {};

  return {
    title: art.title,
    description: art.description ?? undefined,
    alternates: { canonical: `/catalogo/${slug}` },
    openGraph: art.cover_image
      ? { images: [{ url: art.cover_image }] }
      : undefined,
  };
}

export default async function ArticuloDetailPage({ params }: Props) {
  const { slug } = await params;
  const art = await getArticuloBySlug(slug);
  if (!art) notFound();

  // @ts-expect-error -- relación anidada
  const categoria = art.productos as {
    id: string;
    name: string;
    slug: string;
  } | null;

  // @ts-expect-error -- relación anidada
  const mediaRaw = (art.articulos_media ?? []) as {
    id: number;
    url: string;
    alt: string | null;
    order: number;
  }[];

  const photos = [...mediaRaw].sort((a, b) => a.order - b.order);

  const gallery =
    photos.length > 0
      ? photos
      : art.cover_image
        ? [{ id: 0, url: art.cover_image, alt: art.title, order: 0 }]
        : [];

  const mainImage = gallery[0]?.url ?? null;

  const waNumber = "541166924507";
  const waMessage = encodeURIComponent(
    `Hola! Me interesa el producto: ${art.title}${art.price ? ` ($${art.price})` : ""}`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <nav className="flex flex-wrap items-center gap-2 text-xs font-heading text-muted mb-8">
        <Link href="/productos" className="hover:text-accent transition-colors">
          Productos
        </Link>
        {categoria && (
          <>
            <span>/</span>
            <Link
              href={`/productos/${categoria.slug}`}
              className="hover:text-accent transition-colors"
            >
              {categoria.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-paper/70 line-clamp-1">{art.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Galería */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-surface border border-border">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage}
                alt={art.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-muted text-sm">Sin imagen</span>
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {gallery.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-border bg-surface"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.alt ?? art.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {categoria && (
            <Link
              href={`/productos/${categoria.slug}`}
              className="font-heading text-accent text-xs font-semibold mb-2 hover:underline w-fit"
            >
              {categoria.name}
            </Link>
          )}

          <h1 className="font-heading font-bold text-paper text-3xl md:text-4xl leading-tight">
            {art.title}
          </h1>

          <p className="text-accent font-heading font-bold text-2xl md:text-3xl mt-4">
            {art.price ? `$ ${art.price}` : "Consultar precio"}
          </p>

          {art.description && (
            <div className="mt-6">
              <h2 className="font-heading text-sm text-muted mb-2">Descripción</h2>
              <p className="text-paper/90 text-sm leading-relaxed whitespace-pre-line">
                {art.description}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-heading font-semibold bg-accent text-bg px-6 py-3 rounded-sm hover:opacity-90 transition-opacity"
            >
              Consultar por WhatsApp
            </a>
            {categoria && (
              <Link
                href={`/productos/${categoria.slug}`}
                className="inline-flex items-center justify-center font-heading text-sm border border-border text-paper px-6 py-3 rounded-sm hover:border-accent hover:text-accent transition-colors"
              >
                Ver más de {categoria.name}
              </Link>
            )}
          </div>

          <p className="text-muted text-xs mt-6">
            Ubicado en Quilmes / Almirante Brown. Consultá disponibilidad y formas de
            entrega.
          </p>
        </div>
      </div>
    </div>
  );
}
