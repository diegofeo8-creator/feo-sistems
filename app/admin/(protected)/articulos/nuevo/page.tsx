import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createArticle } from "../actions";

export const dynamic = "force-dynamic";

export default async function NuevoArticuloPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: productos } = await supabase
    .from("productos")
    .select("id, name")
    .order("name");

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/articulos"
          className="text-muted hover:text-accent text-sm"
        >
          ← Catálogo
        </Link>
        <h1 className="font-heading font-bold text-2xl">Nuevo artículo</h1>
      </div>

      {error && (
        <p className="bg-red-950/40 border border-red-400/40 text-red-300 text-sm rounded-sm px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <form action={createArticle} className="max-w-2xl space-y-6" encType="multipart/form-data">
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
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
            placeholder="Ej: Control DualSense Blanco"
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
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent resize-y"
            placeholder="Descripción del producto o artículo..."
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
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
              placeholder="Ej: $ 89.990 o Consultar"
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

        {/* Fotos del producto — misma sección que el resto de campos */}
        <div>
          <label
            htmlFor="cover"
            className="block font-heading text-sm text-paper mb-1"
          >
            Fotos del producto
          </label>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-surface file:text-paper file:font-heading file:text-sm hover:file:bg-border"
          />
          <p className="text-muted text-xs mt-1">
            Podés elegir varias. JPG, PNG, WebP, GIF o AVIF. Máx. 8 MB c/u. (Opcional)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="published"
            name="published"
            type="checkbox"
            defaultChecked
            className="w-4 h-4 accent-accent"
          />
          <label htmlFor="published" className="font-heading text-sm text-paper">
            Publicar inmediatamente
          </label>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="font-heading font-semibold bg-accent text-bg px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            Crear artículo
          </button>
          <Link
            href="/admin/articulos"
            className="font-heading text-sm text-muted hover:text-paper"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
