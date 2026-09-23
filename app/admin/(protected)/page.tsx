import Link from "next/link";
import { getAllserviciosForAdmin } from "@/lib/queries";
import { deleteCase, togglePublish } from "./casos/actions";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const servicios = await getAllserviciosForAdmin();

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
        <h1 className="font-heading font-bold text-2xl">Casos ({servicios.length})</h1>
        <Link
          href="/"
          className="font-heading text-sm font-semibold border border-border text-paper px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
        >
          ← Ir a la web pública
        </Link>
      </div>

      {servicios.length === 0 ? (
        <p className="text-muted">Todavía no creaste ningún caso.</p>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted font-heading text-left">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3">{c.title}</td>
                  {/* @ts-expect-error -- relación anidada en tiempo de ejecución */}
                  <td className="px-4 py-3 text-muted">{c.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.published
                          ? "text-accent font-heading text-xs"
                          : "text-muted font-heading text-xs"
                      }
                    >
                      {c.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/casos/${c.id}/editar`}
                        className="text-paper/80 hover:text-accent"
                      >
                        Editar
                      </Link>

                      <form action={togglePublish.bind(null, c.id, c.published)}>
                        <button type="submit" className="text-paper/80 hover:text-accent">
                          {c.published ? "Despublicar" : "Publicar"}
                        </button>
                      </form>

                      <form action={deleteCase.bind(null, c.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={`¿Eliminar "${c.title}"? Esta acción no se puede deshacer.`}
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
