import Link from "next/link";
import ArticuloForm from "@/components/admin/ArticuloForm";
import { getproductos } from "@/lib/queries";
import { createArticulo } from "../actions";

export default async function NuevoArticuloPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const productos = await getproductos();

  return (
    <div>
      <Link
        href="/admin/articulos"
        className="font-heading text-xs text-muted hover:text-accent transition-colors"
      >
        ← Artículos
      </Link>
      <h1 className="font-heading font-bold text-2xl mt-4 mb-6">Nuevo artículo</h1>

      {error && (
        <p className="bg-red-950/40 border border-red-400/40 text-red-300 text-sm rounded-sm px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <ArticuloForm
        action={createArticulo}
        productos={productos.map((p) => ({ id: p.id, name: p.name }))}
        submitLabel="Crear artículo"
      />
    </div>
  );
}
