// Todas las páginas leen datos a través de estas funciones, en vez de
// escribir consultas a Supabase directamente en cada página. Si el
// día de mañana cambia algo de cómo se guardan los datos, se arregla
// en un solo lugar.

import { createClient } from "@/lib/supabase/server";
import type { Case, Category } from "@/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Resuelve la imagen de portada de un caso.
 * Prioridad:
 *  1. servicios.cover_image (si el admin la marcó explícitamente)
 *  2. Primera imagen de la tabla media (ordenada por "order")
 * Así las tarjetas nunca quedan grises si hay al menos una foto subida.
 */
function resolveCoverImage(
  coverImage: string | null | undefined,
  media?: { url: string; type: string; order: number }[] | null
): string | undefined {
  if (coverImage) return coverImage;
  if (!media || media.length === 0) return undefined;
  const firstImage = [...media]
    .filter((m) => m.type === "image")
    .sort((a, b) => a.order - b.order)[0];
  return firstImage?.url;
}

export async function getproductos(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("productos").select("*").order("name");
  if (error) {
    console.error("Error al leer productos:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("productos").select("*").eq("slug", slug).single();
  if (error) return null;
  return data;
}

// productos con su cantidad de casos publicados y numeración —
// formato listo para CategoryCard / productosSection en la Home.
export async function getHomeproductos() {
  const supabase = await createClient();
  const productos = await getproductos();
  const { data: servicios } = await supabase
    .from("servicios")
    .select("category_id")
    .eq("published", true);

  return productos.map((cat, i) => ({
    number: pad(i + 1),
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? "",
    caseCount: (servicios ?? []).filter((c) => c.category_id === cat.id).length,
  }));
}

// Servicios completa agrupada por categoría (patrón de scroll
// horizontal por sección, igual que la referencia).
// Servicios completa: devuelve tanto el listado agrupado por
// categoría (vista de exploración por defecto) como un listado plano
// con año y etiquetas (para que el componente de filtros pueda
// acotar sin volver a pedirle nada al servidor).
export async function getLibraryData() {
  const supabase = await createClient();
  
  // 1. Traemos tus nuevas categorías técnicas de servicios (Limpiezas, Reballing...)
  const { data: categoriasServicios, error: catError } = await supabase
    .from("categorias_servicios")
    .select("id, name, slug");

  if (catError) console.error("Error al leer categorías de servicios:", catError.message);
  const listaCategorias = categoriasServicios ?? [];

  // 2. Traemos tus casos de soporte técnico
  const { data: servicios, error } = await supabase
    .from("servicios")
    .select(
      "id, title, slug, excerpt, cover_image, category_id, tipo_servicio_id, created_at, case_tags(tags(name)), media(url, type, order)"
    )
    .eq("published", true)
    .order("created_at", { ascending: true });

  if (error) console.error("Error al leer casos:", error.message);

  const flatservicios = (servicios ?? []).map((c) => {
    // 3. Comparamos los IDs asegurando que ambos sean tratados como texto para que no choquen (int8 vs String)
    const category = listaCategorias.find((cat) => String(cat.id) === String(c.tipo_servicio_id));
    
    // @ts-expect-error -- la relación media viene anidada en tiempo de ejecución
    const mediaList = c.media as { url: string; type: string; order: number }[] | null;
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      excerpt: c.excerpt ?? "",
      categorySlug: category?.slug ?? "",
      categoryName: category?.name ?? "",
      year: new Date(c.created_at).getFullYear(),
      // @ts-expect-error -- la relación viene anidada en tiempo de ejecución
      tags: (c.case_tags ?? []).map((ct) => ct.tags?.name).filter(Boolean) as string[],
      coverImage: resolveCoverImage(c.cover_image, mediaList),
    };
  });

  return {
    // 4. Le entregamos el resultado con el nombre de variable que el buscador frontend espera
    productos: listaCategorias.map((cat) => ({ slug: cat.slug, name: cat.name })),
    servicios: flatservicios,
  };
}


// Casos destacados para la Home, con su categoría ya incluida.
export async function getFeaturedservicios(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select(
      "id, title, slug, excerpt, cover_image, category:productos(name), media(url, type, order)"
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error al leer casos destacados:", error.message);
    return [];
  }

  return (data ?? []).map((c, i) => {
    // @ts-expect-error -- la relación media viene anidada en tiempo de ejecución
    const mediaList = c.media as { url: string; type: string; order: number }[] | null;
    return {
      number: pad(i + 1),
      title: c.title,
      // @ts-expect-error -- la relación viene anidada en tiempo de ejecución
      category: c.category?.name ?? "",
      excerpt: c.excerpt ?? "",
      slug: c.slug,
      coverImage: resolveCoverImage(c.cover_image, mediaList),
    };
  });
}

export async function getCaseBySlug(slug: string): Promise<Case | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select("*, category:productos(*), media(*), regulations(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data as unknown as Case;
}

export async function getRelatedservicios(caseItem: Case, limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select(
      "id, title, slug, excerpt, cover_image, category:productos(name), media(url, type, order)"
    )
    .eq("category_id", caseItem.category_id)
    .eq("published", true)
    .neq("id", caseItem.id)
    .limit(limit);

  if (error) return [];

  return (data ?? []).map((c, i) => {
    // @ts-expect-error -- la relación media viene anidada en tiempo de ejecución
    const mediaList = c.media as { url: string; type: string; order: number }[] | null;
    return {
      number: pad(i + 1),
      title: c.title,
      // @ts-expect-error -- la relación viene anidada en tiempo de ejecución
      category: c.category?.name ?? "",
      excerpt: c.excerpt ?? "",
      slug: c.slug,
      coverImage: resolveCoverImage(c.cover_image, mediaList),
    };
  });
}

// Caso anterior y siguiente dentro del listado general, para la
// navegación al pie de cada ficha.
export async function getAdjacentservicios(currentCase: Case) {
  const supabase = await createClient();

  const { data: prev } = await supabase
    .from("servicios")
    .select("title, slug")
    .eq("published", true)
    .lt("created_at", currentCase.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: next } = await supabase
    .from("servicios")
    .select("title, slug")
    .eq("published", true)
    .gt("created_at", currentCase.created_at)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { prev: prev ?? null, next: next ?? null };
}

// Número de orden del caso dentro de su categoría (para la cabecera:
// "Categoría · Caso 03"), calculado por antigüedad de publicación.
export async function getCaseNumberInCategory(caseItem: Case) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("servicios")
    .select("id", { count: "exact", head: true })
    .eq("category_id", caseItem.category_id)
    .eq("published", true)
    .lte("created_at", caseItem.created_at);

  return String(count ?? 1).padStart(2, "0");
}

export function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(3, Math.round(words / 180))} min de lectura`;
}

// --- Consultas exclusivas del panel admin (requieren sesión) ---
// Estas traen también los borradores (published = false), algo que
// las políticas de seguridad NO permiten a un visitante anónimo.

export async function getAllserviciosForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select("id, title, slug, published, updated_at, category:productos(name)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error al leer casos (admin):", error.message);
    // Fallback sin relación anidada (evita 500 si la FK no está en el schema cache)
    const plain = await supabase
      .from("servicios")
      .select("id, title, slug, published, updated_at, category_id")
      .order("updated_at", { ascending: false });
    if (plain.error) {
      console.error("Error al leer casos (admin plain):", plain.error.message);
      return [];
    }
    return (plain.data ?? []).map((c) => ({ ...c, category: null }));
  }
  return data ?? [];
}

export async function getCaseByIdForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select("*, media(*), regulations(*), case_tags(tags(*))")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// --- Búsqueda global (Fase 9) ---
// Busca en título, descripción, contenido técnico y en el nombre de
// la categoría. Solo devuelve casos publicados.
export async function searchservicios(query: string) {
  const q = query.trim();
  if (!q) return [];

  const supabase = await createClient();
  const selectFields =
    "id, title, slug, excerpt, cover_image, category:productos(name), media(url, type, order)";

  const [byText, byCategory] = await Promise.all([
    supabase
      .from("servicios")
      .select(selectFields)
      .eq("published", true)
      .or(
        `title.ilike.%${q}%,excerpt.ilike.%${q}%,technical_description.ilike.%${q}%,content.ilike.%${q}%,cause.ilike.%${q}%,solution.ilike.%${q}%`
      ),
    supabase
      .from("productos")
      .select("id")
      .ilike("name", `%${q}%`),
  ]);

  let results = byText.data ?? [];

  const categoryIds = (byCategory.data ?? []).map((c) => c.id);
  if (categoryIds.length > 0) {
    const { data: byCategoryservicios } = await supabase
      .from("servicios")
      .select(selectFields)
      .eq("published", true)
      .in("category_id", categoryIds);

    results = [...results, ...(byCategoryservicios ?? [])];
  }

  // Quita duplicados (un caso puede matchear por texto Y por categoría)
  const seen = new Set<string>();
  const deduped = results.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  return deduped.map((c, i) => {
    // @ts-expect-error -- la relación media viene anidada en tiempo de ejecución
    const mediaList = c.media as { url: string; type: string; order: number }[] | null;
    return {
      number: String(i + 1).padStart(2, "0"),
      title: c.title,
      // @ts-expect-error -- la relación viene anidada en tiempo de ejecución
      category: c.category?.name ?? "",
      excerpt: c.excerpt ?? "",
      slug: c.slug,
      coverImage: resolveCoverImage(c.cover_image, mediaList),
    };
  });
}

// ── Catálogo de Productos (tabla "productos") ────────────────────────
// Nota: "productos" es la misma tabla que antes se llamaba
// "categories" (Humedad, Estructura, Fachadas...). Acá se lee
// completa, incluida la imagen, para armar tarjetas más visuales que
// las de /Servicios (que solo necesitaba nombre + descripción para el
// buscador de categorías del home).
export async function getAllProductos() {
  const productos = await getproductos();
  const supabase = await createClient();
  const { data: servicios } = await supabase
    .from("servicios")
    .select("category_id")
    .eq("published", true);

  return productos.map((p, i) => ({
    number: pad(i + 1),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    image: p.image ?? undefined,
    caseCount: (servicios ?? []).filter((s) => s.category_id === p.id).length,
  }));
}

// Un producto puntual + los servicios/casos publicados que lo tienen
// como categoría. Se usa en /productos/[slug].
export async function getProductoConServicios(slug: string) {
  const producto = await getCategoryBySlug(slug);
  if (!producto) return null;

  const supabase = await createClient();
  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, title, slug, excerpt, cover_image, media(url, type, order)")
    .eq("category_id", producto.id)
    .eq("published", true)
    .order("created_at", { ascending: true });

  const relatedservicios = (servicios ?? []).map((s, i) => {
    // @ts-expect-error -- la relación media viene anidada en tiempo de ejecución
    const mediaList = s.media as { url: string; type: string; order: number }[] | null;
    return {
      number: pad(i + 1),
      title: s.title,
      category: producto.name,
      excerpt: s.excerpt ?? "",
      slug: s.slug,
      coverImage: resolveCoverImage(s.cover_image, mediaList),
    };
  });

  return { producto, servicios: relatedservicios };
}

export async function getArticulosByCategoryId(categoryId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articulos_categoria")
    .select("id, title, slug, description, price, cover_image, category_id")
    .eq("category_id", categoryId)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(0, 31); // Límite estricto de 32 artículos por página

  if (error) {
    console.error("Error al leer artículos de la categoría:", error.message);
    return [];
  }

  return data ?? [];
}


// ── Admin: artículos del catálogo (tabla articulos_categoria) ────────
// Misma forma de select que el catálogo público (productos(...)),
// sin pedir columnas que pueden no existir (updated_at/created_at).
export async function getAllArticulosForAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articulos_categoria")
    .select(
      "id, title, slug, published, price, category_id, productos ( name, slug )"
    )
    .order("title", { ascending: true });

  if (error) {
    console.error("Error al listar artículos (admin):", error.message);
    // Fallback mínimo: solo columnas base, sin relación
    const plain = await supabase
      .from("articulos_categoria")
      .select("id, title, slug, published, price, category_id");
    if (plain.error) {
      console.error("Error al listar artículos (admin plain):", plain.error.message);
      return [];
    }
    return (plain.data ?? []).map((a) => ({ ...a, category: null }));
  }

  // La UI del admin espera a.category?.name
  return (data ?? []).map((a) => {
    // @ts-expect-error — relación anidada en runtime
    const cat = a.productos ?? null;
    return { ...a, category: cat };
  });
}

export async function getArticuloByIdForAdmin(id: string | number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articulos_categoria")
    .select(
      "id, title, slug, description, price, cover_image, published, category_id, productos ( id, name, slug )"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("Error getArticuloByIdForAdmin:", error?.message);
    const plain = await supabase
      .from("articulos_categoria")
      .select(
        "id, title, slug, description, price, cover_image, published, category_id"
      )
      .eq("id", id)
      .maybeSingle();
    if (plain.error || !plain.data) return null;
    return { ...plain.data, category: null };
  }

  // @ts-expect-error — relación anidada en runtime
  return { ...data, category: data.productos ?? null };
}
