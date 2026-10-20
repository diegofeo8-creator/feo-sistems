import Link from "next/link";
import { notFound } from "next/navigation";
import ArticuloForm from "@/components/admin/ArticuloForm";
import ArticleMediaManager from "@/components/admin/ArticleMediaManager";
import { getproductos, getArticuloByIdForAdmin } from "@/lib/queries";
import { updateArticulo } from "../../actions";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditarArticuloPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;

  const [articulo, productos, mediaResult] = await Promise.all([
    getArticuloByIdForAdmin(id),
    getproductos(),
    (async () => {
      const supabase = await createClient();
      return supabase
        .from("articulos_media")
        .select("id, url, alt, order")
        .eq("articulo_id", id)
        .order("order", { ascending: true });
    })(),
  ]);

  if (!articulo) notFound();

  const boundUpdate = updateArticulo.bind(null, id);
  const photos = (mediaResult.data ?? []).map((p) => ({
    id: p.id as number,
    url: p.url as string,
    alt: (p.alt as string | null) ?? null,
    order: (p.order as number | undefined) ?? 0,
  }));

  // articleId numérico si aplica; si es uuid, ArticleMediaManager acepta string en runtime
  const articleIdNum = Number(id);
  const articleIdProp = Number.isFinite(articleIdNum) && String(articleIdNum) === String(id)
    ? articleIdNum
    : (id as unknown as number);

  return (
    <div className="space-y-12">
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

      <ArticleMediaManager
        articleId={articleIdProp}
        coverImage={articulo.cover_image ?? null}
        photos={photos}
      />
    </div>
  );
}
