import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateArticle } from "../../actions";
import ArticleMediaManager from "@/components/admin/ArticleMediaManager";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function EditarArticuloPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { error, success } = await searchParams;
  const articleId = Number(id);

  if (!Number.isFinite(articleId) || articleId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const { data: articulo, error: artError } = await supabase
    .from("articulos_categoria")
    .select(
      "id, title, slug, description, price, cover_image, published, category_id"
    )
    .eq("id", articleId)
    .maybeSingle();

  if (artError) {
    console.error("Error cargando artículo:", artError.message);
  }
  if (!articulo) notFound();

  const { data: productos } = await supabase
    .from("productos")
    .select("id, name")
    .order("name");

  const { data: mediaRaw, error: mediaError } = await supabase
    .from("articulos_media")
    .select('id, url, alt, "order"')
    .eq("articulo_id", articleId);

  if (mediaError) {
    console.error("Error cargando media:", mediaError.message);
  }

  type MediaRow = {
    id: number;
    url: string;
    alt: string | null;
    order?: number;
  };

  const photos: MediaRow[] = ((mediaRaw as MediaRow[] | null) ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const boundUpdate = updateArticle.bind(null, Number(articulo.id));

  return (
    <div className="space-y-12">
      {error && (
        <p className="bg-red-950/40 border border-red-400/40 text-red-300 text-sm rounded-sm px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="bg-accent/10 border border-accent/40 text-accent text-sm rounded-sm px-4 py-3">
          {success}
        </p>
      )}

      <div>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/articulos"
            className="text-muted hover:text-accent text-sm"
          >
            ← Catálogo
          </Link>
          <h1 className="font-heading font-bold text-2xl">Editar artículo</h1>
        </div>

        <form action={boundUpdate} className="max-w-2xl space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block font-heading text-sm text-paper mb-1"
            >
              Título *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              defaultValue={articulo.title}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block font-heading text-sm text-paper mb-1"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              maxLength={2000}
              defaultValue={articulo.description ?? ""}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="price"
                className="block font-heading text-sm text-paper mb-1"
              >
                Precio
              </label>
              <input
                id="price"
                name="price"
                type="text"
                maxLength={50}
                defaultValue={articulo.price ?? ""}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label
                htmlFor="category_id"
                className="block font-heading text-sm text-paper mb-1"
              >
                Categoría
              </label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={articulo.category_id ?? ""}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
              >
                <option value="">— Sin categoría —</option>
                {(productos ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={!!articulo.published}
              className="w-4 h-4 accent-accent"
            />
            <label
              htmlFor="published"
              className="font-heading text-sm text-paper"
            >
              Publicado
            </label>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="font-heading font-semibold bg-accent text-bg px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
            >
              Guardar cambios
            </button>
            <Link
              href="/admin/articulos"
              className="font-heading text-sm text-muted hover:text-paper"
            >
              Cancelar
            </Link>
            {articulo.slug && (
              <Link
                href={`/catalogo/${articulo.slug}`}
                target="_blank"
                className="font-heading text-sm text-muted hover:text-accent ml-auto"
              >
                Ver en el sitio →
              </Link>
            )}
          </div>
        </form>
      </div>

      <ArticleMediaManager
        articleId={Number(articulo.id)}
        coverImage={articulo.cover_image}
        photos={photos}
      />
    </div>
  );
}
