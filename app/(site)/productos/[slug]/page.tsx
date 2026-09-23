import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import CaseCard from "@/components/servicios/CaseCard";
import { getProductoConServicios } from "@/lib/queries";

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

      <h2 className="font-heading font-bold text-paper text-2xl mb-6">
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
