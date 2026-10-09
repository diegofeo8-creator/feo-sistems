import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteArticle, togglePublish } from "./actions";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function ArticulosPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const supabase = await createClient();

  const { data: articulos, error: fetchError } = await supabase
    .from("articulos_categoria")
    .select(
      `
      id,
      title,
      slug,
      price,
      published,
      cover_image,
      category_id,
      productos ( id, name )
    `
    )
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Error al cargar artículos:", fetchError.message);
  }

  const list = articulos ?? [];

  return (
    <div>
      {success && (
        <p className="bg-accent/10 border border-accent/40 text-accent text-sm rounded-sm px-4 py-3 mb-6">
          {success}
        </p>
      )}
      {error && (
        <p className="bg-red-950/40 border border-red-400/40 text-red-300 text-sm rounded-sm px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="font-heading font-bold text-2xl">
          Catálogo ({list.length})
        </h1>
        <Link
          href="/admin/articulos/nuevo"
          className="font-heading text-sm font-semibold bg-accent text-bg px-4 py-2 rounded-sm hover:opacity-90 transition-opacity"
        >
          + Nuevo artículo
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="text-muted">Todavía no creaste ningún artículo del catálogo.</p>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted font-heading text-left">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {a.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.cover_image}
                          alt=""
                          className="w-10 h-10 object-cover rounded-sm border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-sm border border-border bg-surface flex items-center justify-center text-muted text-xs">
                          —
                        </div>
                      )}
                      <span>{a.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {/* @ts-expect-error -- relación anidada en tiempo de ejecución */}
                    {a.productos?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{a.price ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        a.published
                          ? "text-accent font-heading text-xs"
                          : "text-muted font-heading text-xs"
                      }
                    >
                      {a.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/articulos/${a.id}/editar`}
                        className="text-paper/80 hover:text-accent"
                      >
                        Editar
                      </Link>

                      <form action={togglePublish.bind(null, a.id, a.published)}>
                        <button
                          type="submit"
                          className="text-paper/80 hover:text-accent"
                        >
                          {a.published ? "Despublicar" : "Publicar"}
                        </button>
                      </form>

                      <form action={deleteArticle.bind(null, a.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={`¿Eliminar "${a.title}"? Esta acción no se puede deshacer.`}
                          className="text-red-400/80 hover:text-red-400"
                        >
                          Eliminar
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
