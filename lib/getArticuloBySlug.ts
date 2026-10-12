// Reemplazá getArticuloBySlug en src/lib/queries.ts por esta versión.

export async function getArticuloBySlug(slug: string) {
  const supabase = await createClient();

  // 1) Intento con relación (FK category_id → productos)
  const withJoin = await supabase
    .from("articulos_categoria")
    .select(
      "id, title, slug, description, price, cover_image, category_id, category:productos(id, name, slug)"
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!withJoin.error && withJoin.data) {
    return withJoin.data;
  }

  if (withJoin.error) {
    console.error(
      "[getArticuloBySlug] join error:",
      withJoin.error.message,
      withJoin.error.details,
      withJoin.error.hint
    );
  }

  // 2) Fallback sin join (por si la FK no está expuesta en PostgREST)
  const plain = await supabase
    .from("articulos_categoria")
    .select("id, title, slug, description, price, cover_image, category_id")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (plain.error) {
    console.error("[getArticuloBySlug] plain error:", plain.error.message);
    return null;
  }
  if (!plain.data) return null;

  let category: { id: string; name: string; slug: string } | null = null;
  if (plain.data.category_id) {
    const cat = await supabase
      .from("productos")
      .select("id, name, slug")
      .eq("id", plain.data.category_id)
      .maybeSingle();
    if (cat.data) category = cat.data;
  }

  return { ...plain.data, category };
}
