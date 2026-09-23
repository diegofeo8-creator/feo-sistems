import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Gallery from "@/components/gallery/Gallery";
import VideoPlayer from "@/components/servicios/VideoPlayer";
import RegulationCard from "@/components/servicios/RegulationCard";
import Relatedservicios from "@/components/servicios/RelatedServicios";
import CaseNav from "@/components/servicios/CaseNav";
import {
  getCaseBySlug,
  getRelatedservicios,
  getAdjacentservicios,
  getCaseNumberInCategory,
  estimateReadTime,
} from "@/lib/queries";

export const revalidate = 60; // segundos

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCaseBySlug(slug);
  if (!c) return {};

  const title = c.seo_title ?? c.title;
  const description = c.seo_description ?? c.excerpt ?? undefined;
  const url = `/Servicios/${c.slug}`;
  const image = c.cover_image ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CasoPage({ params }: PageProps) {
  const { slug } = await params;
  const c = await getCaseBySlug(slug);
  if (!c) notFound();

  const [related, { prev, next }, caseNumber] = await Promise.all([
    getRelatedservicios(c),
    getAdjacentservicios(c),
    getCaseNumberInCategory(c),
  ]);

  const images = (c.media ?? [])
    .filter((m) => m.type === "image")
    .map((m) => ({ url: m.url, alt: m.alt ?? c.title, caption: m.caption ?? "" }));

  const video = (c.media ?? []).find((m) => m.type === "video");

  // Imagen principal: la que el admin marcó como cover_image, o la primera
  // de la galería si aún no eligió ninguna (mismo criterio que las tarjetas).
  const mainImage = c.cover_image ?? images[0]?.url ?? null;

  const date = new Date(c.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Datos estructurados (Schema.org) para que los buscadores entiendan
  // que esta página es un artículo técnico, con su fecha y categoría.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: c.title,
    description: c.excerpt ?? undefined,
    datePublished: c.created_at,
    dateModified: c.updated_at,
    articleSection: c.category?.name,
    url: `${siteUrl}/Servicios/${c.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Feo & Sistems",
    },
  };

  return (
    <article className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4 font-heading text-sm">
          {c.category && (
            <Link href={`/productos/${c.category.slug}`} className="text-accent hover:opacity-80">
              {c.category.name}
            </Link>
          )}
          <span className="text-muted">·</span>
          <span className="text-muted">Caso {caseNumber}</span>
        </div>
        <h1 className="font-heading font-bold text-paper text-3xl md:text-5xl leading-tight">
          {c.title}
        </h1>
        {c.subtitle && <p className="text-muted mt-4 text-lg">{c.subtitle}</p>}
        <div className="text-muted text-sm mt-4">
          {date} · {estimateReadTime(c.content ?? "")}
        </div>
      </header>

      {mainImage ? (
        <div className="relative aspect-video rounded-sm overflow-hidden mb-12">
          <Image src={mainImage} alt={c.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
        </div>
      ) : video ? (
        <div className="mb-12">
          <VideoPlayer videoId={video.url} title={c.title} />
        </div>
      ) : (
        <div className="aspect-video bg-surface border border-border rounded-sm mb-12 flex items-center justify-center">
          <span className="text-muted text-sm">Todavía no hay imagen principal para este caso.</span>
        </div>
      )}

      <div className="space-y-10 font-body text-paper/90 leading-relaxed">
        {c.content && (
          <section>
            <h2 className="font-heading font-semibold text-accent text-sm mb-3">01 — EL PROBLEMA</h2>
            <p>{c.content}</p>
          </section>
        )}

        {c.technical_description && (
          <section>
            <h2 className="font-heading font-semibold text-accent text-sm mb-3">02 — QUÉ OCURRIÓ</h2>
            <p>{c.technical_description}</p>
          </section>
        )}

        {c.cause && (
          <section>
            <h2 className="font-heading font-semibold text-accent text-sm mb-3">03 — POR QUÉ OCURRIÓ</h2>
            <p>{c.cause}</p>
          </section>
        )}

        <section>
          <h2 className="font-heading font-semibold text-accent text-sm mb-3">GALERÍA</h2>
          <Gallery images={images} />
        </section>

        {c.consequences && (
          <section>
            <h2 className="font-heading font-semibold text-accent text-sm mb-3">04 — CONSECUENCIAS</h2>
            <p>{c.consequences}</p>
          </section>
        )}

        {c.solution && (
          <section>
            <h2 className="font-heading font-semibold text-accent text-sm mb-3">05 — SOLUCIÓN</h2>
            <p>{c.solution}</p>
          </section>
        )}

        <section>
          <h2 className="font-heading font-semibold text-accent text-sm mb-3">MIRA EL CASO EN VÍDEO</h2>
          <VideoPlayer videoId={video?.url ?? null} title={c.title} />
        </section>

        {c.regulations && c.regulations.length > 0 && (
          <section>
            <h2 className="font-heading font-semibold text-accent text-sm mb-3">06 — NORMATIVA</h2>
            <div className="space-y-3">
              {c.regulations.map((n) => (
                <RegulationCard key={n.id} code={n.name} description={n.description ?? ""} />
              ))}
            </div>
          </section>
        )}

        {c.estimated_cost && (
          <section>
            <h2 className="font-heading font-semibold text-accent text-sm mb-3">07 — COSTE</h2>
            <p>{c.estimated_cost}</p>
          </section>
        )}
      </div>

      <Relatedservicios servicios={related} />
      <CaseNav prev={prev} next={next} />
    </article>
  );
}
