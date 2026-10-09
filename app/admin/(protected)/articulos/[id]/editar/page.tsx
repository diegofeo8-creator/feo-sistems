import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  updateArticle,
  uploadMedia,
  deleteMedia,
  setCoverFromMedia,
} from "../../actions";

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

  const [{ data: articulo }, { data: productos }, { data: media }] =
    await Promise.all([
      supabase
        .from("articulos_categoria")
        .select(
          `
        id,
        title,
        slug,
        description,
        price,
        cover_image,
        published,
        category_id
      `
        )
        .eq("id", articleId)
        .maybeSingle(),
      supabase.from("productos").select("id, name").order("name"),
      supabase
        .from("articulos_media")
        .select("id, url, alt, order")
        .eq("articulo_id", articleId)
        .order("order", { ascending: true }),
    ]);

  if (!articulo) notFound();

  const boundUpdate = updateArticle.bind(null, articulo.id);
  const boundUpload = uploadMedia.bind(null, articulo.id);
  const photos = media ?? [];

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
              defaultChecked={articulo.published}
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
            <Link
              href={`/catalogo/${articulo.slug}`}
              target="_blank"
              className="font-heading text-sm text-muted hover:text-accent ml-auto"
            >
              Ver en el sitio →
            </Link>
          </div>
        </form>
      </div>

      {/* ── Galería de fotos ───────────────────────────────────────── */}
      <div className="max-w-3xl border-t border-border pt-8">
        <h2 className="font-heading font-bold text-xl mb-2">
          Fotos del producto ({photos.length})
        </h2>
        <p className="text-muted text-sm mb-6">
          Podés subir varias. La que marques como principal se muestra en las
          tarjetas del catálogo.
        </p>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {photos.map((photo) => {
              const isCover = articulo.cover_image === photo.url;
              return (
                <div
                  key={photo.id}
                  className={`relative group rounded-sm border overflow-hidden ${
                    isCover ? "border-accent ring-1 ring-accent/40" : "border-border"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.alt ?? ""}
                    className="w-full aspect-square object-cover"
                  />
                  {isCover && (
                    <span className="absolute top-1 left-1 bg-accent text-bg text-[10px] font-heading font-semibold px-1.5 py-0.5 rounded-sm">
                      Principal
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-bg/90 p-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isCover && (
                      <form action={setCoverFromMedia.bind(null, photo.id, articulo.id)}>
                        <button
                          type="submit"
                          className="text-[10px] font-heading text-paper hover:text-accent px-1"
                        >
                          Principal
                        </button>
                      </form>
                    )}
                    <form action={deleteMedia.bind(null, photo.id, articulo.id)}>
                      <button
                        type="submit"
                        className="text-[10px] font-heading text-red-400/80 hover:text-red-400 px-1"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <form action={boundUpload} className="space-y-4" encType="multipart/form-data">
          <div>
            <label
              htmlFor="files"
              className="block font-heading text-sm text-paper mb-1"
            >
              Agregar fotos
            </label>
            <input
              id="files"
              name="files"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple
              required
              className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-surface file:text-paper file:font-heading file:text-sm hover:file:bg-border"
            />
            <p className="text-muted text-xs mt-1">
              Podés seleccionar varias a la vez. JPG, PNG, WebP, GIF o AVIF. Máx. 8 MB c/u.
            </p>
          </div>
          <button
            type="submit"
            className="font-heading text-sm font-semibold border border-border text-paper px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Subir fotos
          </button>
        </form>
      </div>
    </div>
  );
}
