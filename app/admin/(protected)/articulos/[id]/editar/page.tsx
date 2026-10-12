import Link from "next/link";
import { notFound } from "next/navigation";
import ArticuloForm from "@/components/admin/ArticuloForm";
import { getproductos, getArticuloByIdForAdmin } from "@/lib/queries";
import { updateArticulo } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditarArticuloPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;

  const [articulo, productos] = await Promise.all([
    getArticuloByIdForAdmin(id),
    getproductos(),
  ]);

  if (!articulo) notFound();

  const boundUpdate = updateArticulo.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/articulos"
        className="font-heading text-xs text-muted hover:text-accent transition-colors"
      >
        ← Artículos
      </Link>
      <h1 className="font-heading font-bold text-2xl mt-4 mb-6">Editar artículo</h1>

      {error && (
        <p className="bg-red-950/40 border border-red-400/40 text-red-300 text-sm rounded-sm px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <ArticuloForm
        action={boundUpdate}
        productos={productos.map((p) => ({ id: p.id, name: p.name }))}
        submitLabel="Guardar cambios"
        defaults={{
          title: articulo.title,
          description: articulo.description,
          price: articulo.price,
          cover_image: articulo.cover_image,
          category_id: articulo.category_id,
          published: articulo.published,
        }}
      />
    </div>
  );
}
