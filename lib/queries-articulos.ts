// Pegar / mergear en src/lib/queries.ts

export async function getArticulosByCategoryId(categoryId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articulos_categoria")
    .select("id, title, slug, description, price, cover_image, category_id")
    .eq("category_id", categoryId)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(0, 31);

  if (error) {
    console.error("Error al leer artículos de la categoría:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getArticuloBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articulos_categoria")
    .select(
      "id, title, slug, description, price, cover_image, category_id, category:productos(id, name, slug)"
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getAllArticulosForAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articulos_categoria")
    .select(
      "id, title, slug, published, price, updated_at, created_at, category:productos(name, slug)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al listar artículos (admin):", error.message);
    return [];
  }

  return data ?? [];
}

export async function getArticuloByIdForAdmin(id: string | number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articulos_categoria")
    .select(
      "id, title, slug, description, price, cover_image, published, category_id, category:productos(id, name, slug)"
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}
