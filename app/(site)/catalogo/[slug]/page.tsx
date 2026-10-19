import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductGallery from "@/components/catalogo/ProductGallery";
import ProductOfferCard from "@/components/catalogo/ProductOfferCard";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticuloBySlug(slug: string) {
  const supabase = await createClient();

  // 1) Query base (columnas que SIEMPRE existen) — garantiza que la página no caiga en 404
  const { data: base, error: baseError } = await supabase
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
      articulos_media ( id, url, alt, "order" )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (baseError || !base) return null;

  // 2) Intentamos traer las columnas nuevas (si aún no existen, no rompemos nada)
  let mercadolibre_url: string | null = null;
  let facebook_marketplace_url: string | null = null;
  let original_price: string | number | null = null;
  let discount_note: string | null = null;

  try {
    const { data: extra, error: extraError } = await supabase
      .from("articulos_categoria")
      .select(
        "mercadolibre_url, facebook_marketplace_url, original_price, discount_note"
      )
      .eq("id", base.id)
      .maybeSingle();

    // Si PostgREST se queja de columnas inexistentes, extraError tendrá mensaje
    if (!extraError && extra) {
      // @ts-expect-error -- columnas opcionales
      mercadolibre_url = extra.mercadolibre_url ?? null;
      // @ts-expect-error -- columnas opcionales
      facebook_marketplace_url = extra.facebook_marketplace_url ?? null;
      // @ts-expect-error -- columnas opcionales
      original_price = extra.original_price ?? null;
      // @ts-expect-error -- columnas opcionales
      discount_note = extra.discount_note ?? null;
    }
  } catch {
    // Las columnas todavía no existen → seguimos con nulls
  }

  // Fallback: si el select con original_price/discount_note falló,
  // intentamos solo las dos URLs que sí existen en la tabla
  if (!mercadolibre_url && !facebook_marketplace_url) {
    try {
      const { data: urls, error: urlsError } = await supabase
        .from("articulos_categoria")
        .select("mercadolibre_url, facebook_marketplace_url")
        .eq("id", base.id)
        .maybeSingle();

      if (!urlsError && urls) {
        // @ts-expect-error -- columnas opcionales
        mercadolibre_url = urls.mercadolibre_url ?? null;
        // @ts-expect-error -- columnas opcionales
        facebook_marketplace_url = urls.facebook_marketplace_url ?? null;
      }
    } catch {
      // ignore
    }
  }

  return {
    ...base,
    mercadolibre_url,
    facebook_marketplace_url,
    original_price,
    discount_note,
  };
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
    order?: number;
  }[];

  const photos = [...mediaRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const gallery =
    photos.length > 0
      ? photos.map((p) => ({ id: p.id, url: p.url, alt: p.alt }))
      : art.cover_image
        ? [{ id: 0, url: art.cover_image, alt: art.title }]
        : [];

  const waNumber = "541166924507";
  const waMessage = encodeURIComponent(
    `Hola! Me interesa el producto: ${art.title}${art.price ? ` ($${art.price})` : ""}`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
        {/* Columna izquierda: Galería + precio pegados arriba, sin estirar */}
        <div className="w-full lg:col-span-3 flex flex-col gap-6">
          <ProductGallery photos={gallery} title={art.title} />
          <ProductOfferCard
            price={art.price}
            originalPrice={art.original_price}
            title={art.title}
            mercadolibreUrl={art.mercadolibre_url}
            facebookUrl={art.facebook_marketplace_url}
            discountNote={art.discount_note}
          />
        </div>

        {/* Info — desplazada a la derecha, ancho de lectura limitado */}
        <div className="w-full lg:col-span-2 flex flex-col gap-4">
          <div className="max-w-xl lg:max-w-2xl">
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
    </div>
  );
}
