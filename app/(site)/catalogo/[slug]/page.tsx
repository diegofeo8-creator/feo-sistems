import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticuloBySlug } from "@/lib/queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const art = await getArticuloBySlug(slug);
    if (!art) return { title: "Artículo no encontrado" };
    return {
      title: art.title,
      description: art.description ?? undefined,
      alternates: { canonical: `/catalogo/${slug}` },
    };
  } catch {
    return { title: "Catálogo" };
  }
}

export default async function CatalogoArticuloPage({ params }: Props) {
  const { slug } = await params;

  let art: Awaited<ReturnType<typeof getArticuloBySlug>> = null;
  try {
    art = await getArticuloBySlug(slug);
  } catch (e) {
    console.error("[catalogo/[slug]] getArticuloBySlug failed:", e);
    notFound();
  }

  if (!art) notFound();

  // category puede venir como objeto o como array según cómo responda PostgREST
  const rawCategory = (art as { category?: unknown }).category;
  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
  const categoryName =
    (category as { name?: string } | null | undefined)?.name ?? "Productos";
  const categorySlug = (category as { slug?: string } | null | undefined)?.slug;

  const price =
    art.price && String(art.price).trim() ? String(art.price).trim() : "Consultar precio";

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <Link
        href={categorySlug ? `/productos/${categorySlug}` : "/productos"}
        className="font-heading text-xs text-muted hover:text-accent transition-colors"
      >
        ← {categoryName.toUpperCase()}
      </Link>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface border border-border">
          {art.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={art.cover_image}
              alt={art.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-muted text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        <div>
          <p className="font-heading text-accent text-sm mb-2">{categoryName}</p>
          <h1 className="font-heading font-bold text-paper text-3xl md:text-4xl">
            {art.title}
          </h1>
          <p className="font-heading font-bold text-accent text-2xl mt-4">{price}</p>
          {art.description && (
            <p className="text-muted mt-6 leading-relaxed whitespace-pre-line">
              {art.description}
            </p>
          )}
          <Link
            href="/contacto"
            className="mt-8 inline-flex font-heading text-sm font-semibold tracking-wide text-bg bg-accent px-6 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            Consultar disponibilidad
          </Link>
        </div>
      </div>
    </div>
  );
}
