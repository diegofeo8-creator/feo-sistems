import type { Metadata } from "next";
import CaseCard from "@/components/servicios/CaseCard";
import { searchservicios } from "@/lib/queries";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = {
  title: "Buscar",
};

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const results = q ? await searchservicios(q) : [];

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <p className="font-heading text-accent text-sm font-semibold mb-2">BÚSQUEDA</p>
      <h1 className="font-heading font-bold text-paper text-3xl md:text-4xl mb-2">
        {q ? `Resultados para "${q}"` : "Buscar casos"}
      </h1>
      <p className="text-muted mb-10">
        {q ? `${results.length} caso${results.length === 1 ? "" : "s"} encontrado${results.length === 1 ? "" : "s"}.` : "Escribí un término en el buscador del menú."}
      </p>

      {q && results.length === 0 && (
        <p className="font-heading text-paper/80 border border-border rounded-sm px-6 py-10 text-center">
          NO ENCONTRAMOS CASOS RELACIONADOS.
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((c) => (
            <CaseCard key={c.slug} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}
