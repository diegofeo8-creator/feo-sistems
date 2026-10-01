import Link from "next/link";
import CaseCard from "@/components/servicios/CaseCard";

interface LibraryPreviewSectionProps {
  servicios: {
    number: string;
    title: string;
    category: string;
    excerpt: string;
    slug: string;
    coverImage?: string;
  }[];
  totalCount: number;
}

export default function LibraryPreviewSection({
  servicios,
  totalCount,
}: LibraryPreviewSectionProps) {
  return (
    // Menos padding superior para reducir el hueco bajo Productos
    <section className="max-w-6xl mx-auto px-6 pt-6 pb-3xl">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-heading font-bold text-paper text-3xl">Los Servicios</h2>
          <p className="text-muted mt-2">
            {totalCount} casos documentados.
          </p>
        </div>
        <Link
          href="/Servicios"
          className="font-heading text-sm text-accent hidden md:block hover:opacity-80"
        >
          Ver todos los casos
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicios.map((c) => (
          <CaseCard key={c.slug} {...c} glow />
        ))}
      </div>
      <Link
        href="/Servicios"
        className="font-heading text-sm text-accent block md:hidden mt-6"
      >
        Ver todos los casos
      </Link>
    </section>
  );
}
