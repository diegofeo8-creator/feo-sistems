import Link from "next/link";
import { getAllArticulosForAdmin } from "@/lib/queries";
import { deleteArticulo, togglePublishArticulo } from "./actions";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

export default async function AdminArticulosPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const articulos = await getAllArticulosForAdmin();

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

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-2xl">Artículos del catálogo</h1>
        <Link
          href="/admin/articulos/nuevo"
          className="font-heading text-sm font-semibold bg-accent text-bg px-3 py-1.5 rounded-sm hover:opacity-90"
        >
          + Nuevo artículo
        </Link>
      </div>

      {articulos.length === 0 ? (
        <p className="text-muted text-sm border border-border rounded-sm px-6 py-10 text-center">
          Todavía no hay artículos. Creá el primero.
        </p>
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
              {articulos.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-muted text-xs mt-0.5">/catalogo/{a.slug}</div>
                  </td>
                  {/* @ts-expect-error relación anidada */}
                  <td className="px-4 py-3 text-muted">{a.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{a.price || "—"}</td>
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
                      {a.published && (
                        <Link
                          href={`/catalogo/${a.slug}`}
                          target="_blank"
                          className="text-paper/80 hover:text-accent"
                        >
                          Ver
                        </Link>
                      )}
                      <Link
                        href={`/admin/articulos/${a.id}/editar`}
                        className="text-paper/80 hover:text-accent"
                      >
                        Editar
                      </Link>
                      <form action={togglePublishArticulo.bind(null, String(a.id), a.published)}>
                        <button type="submit" className="text-paper/80 hover:text-accent">
                          {a.published ? "Despublicar" : "Publicar"}
                        </button>
                      </form>
                      <form action={deleteArticulo.bind(null, String(a.id))}>
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
