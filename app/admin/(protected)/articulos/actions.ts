"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  excludeId?: string | number
): Promise<string> {
  const base = slugify(title) || "articulo";
  let candidate = base;
  let n = 2;

  for (;;) {
    let query = supabase.from("articulos_categoria").select("id").eq("slug", candidate);
    if (excludeId !== undefined && excludeId !== null && excludeId !== "") {
      query = query.neq("id", excludeId);
    }
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 50) return `${base}-${Date.now()}`;
  }
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return { supabase, user };
}

function readFields(formData: FormData) {
  return {
    title: ((formData.get("title") as string) ?? "").trim(),
    description: ((formData.get("description") as string) ?? "").trim(),
    price: ((formData.get("price") as string) ?? "").trim(),
    original_price: ((formData.get("original_price") as string) ?? "").trim() || null,
    cover_image: ((formData.get("cover_image") as string) ?? "").trim() || null,
    category_id: ((formData.get("category_id") as string) ?? "").trim(),
    published: formData.get("published") === "on" || formData.get("published") === "true",
  };
}

export async function createArticulo(formData: FormData) {
  const { supabase } = await requireUser();
  const fields = readFields(formData);

  if (!fields.title) {
    redirect("/admin/articulos/nuevo?error=" + encodeURIComponent("El título es obligatorio."));
  }
  if (!fields.category_id) {
    redirect(
      "/admin/articulos/nuevo?error=" + encodeURIComponent("Elegí una categoría.")
    );
  }

  const slug = await uniqueSlug(supabase, fields.title);

  const { data, error } = await supabase
    .from("articulos_categoria")
    .insert({
      title: fields.title,
      description: fields.description || null,
      price: fields.price || null,
      original_price: fields.original_price,
      cover_image: fields.cover_image,
      category_id: fields.category_id,
      published: fields.published,
      slug,
    })
    .select("id")
    .single();

  if (error) {
    redirect(
      "/admin/articulos/nuevo?error=" +
        encodeURIComponent("No se pudo crear: " + error.message)
    );
  }

  revalidatePath("/admin/articulos");
  revalidatePath("/productos");
  revalidatePath("/catalogo/" + slug);
  redirect(
    "/admin/articulos?success=" +
      encodeURIComponent(`Artículo "${fields.title}" creado.`)
  );
}

export async function updateArticulo(articuloId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const fields = readFields(formData);

  if (!fields.title) {
    redirect(
      `/admin/articulos/${articuloId}/editar?error=` +
        encodeURIComponent("El título es obligatorio.")
    );
  }
  if (!fields.category_id) {
    redirect(
      `/admin/articulos/${articuloId}/editar?error=` +
        encodeURIComponent("Elegí una categoría.")
    );
  }

  const slug = await uniqueSlug(supabase, fields.title, articuloId);

  const payload: Record<string, unknown> = {
    title: fields.title,
    description: fields.description || null,
    price: fields.price || null,
    original_price: fields.original_price,
    cover_image: fields.cover_image,
    category_id: fields.category_id,
    published: fields.published,
    slug,
  };

  let { error } = await supabase
    .from("articulos_categoria")
    .update(payload)
    .eq("id", articuloId);

  // Si la columna original_price no existe aún, reintentar sin ella
  if (error && /original_price/i.test(error.message)) {
    delete payload.original_price;
    ({ error } = await supabase
      .from("articulos_categoria")
      .update(payload)
      .eq("id", articuloId));
    if (!error) {
      redirect(
        `/admin/articulos/${articuloId}/editar?error=` +
          encodeURIComponent(
            "Se guardó el resto, pero falta la columna original_price en Supabase. Creala (text) para poder editar el precio de cuotas."
          )
      );
    }
  }

  if (error) {
    redirect(
      `/admin/articulos/${articuloId}/editar?error=` +
        encodeURIComponent("No se pudo guardar: " + error.message)
    );
  }

  revalidatePath("/admin/articulos");
  revalidatePath("/productos");
  revalidatePath("/catalogo/" + slug);
  redirect(
    "/admin/articulos?success=" +
      encodeURIComponent(`Artículo "${fields.title}" actualizado.`)
  );
}

export async function deleteArticulo(articuloId: string) {
  const { supabase } = await requireUser();
  await supabase.from("articulos_categoria").delete().eq("id", articuloId);
  revalidatePath("/admin/articulos");
  revalidatePath("/productos");
  redirect(
    "/admin/articulos?success=" + encodeURIComponent("Artículo eliminado.")
  );
}

export async function togglePublishArticulo(
  articuloId: string,
  published: boolean
) {
  const { supabase } = await requireUser();
  await supabase
    .from("articulos_categoria")
    .update({ published: !published })
    .eq("id", articuloId);
  revalidatePath("/admin/articulos");
  revalidatePath("/productos");
  revalidatePath("/catalogo");
}


// ── Galería de fotos del artículo (articulos_media + storage) ────────

export async function registerMedia(input: {
  articleId: number | string;
  url: string;
  alt?: string;
  order?: number;
}): Promise<{ id?: number; error?: string }> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("articulos_media")
    .insert({
      articulo_id: input.articleId,
      url: input.url,
      alt: input.alt ?? null,
      order: input.order ?? 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("registerMedia:", error.message);
    return { error: error.message };
  }

  revalidatePath(`/admin/articulos/${input.articleId}/editar`);
  revalidatePath("/catalogo");
  return { id: data.id as number };
}

export async function deleteMedia(
  mediaId: number | string,
  articleId: number | string
): Promise<{ error?: string }> {
  const { supabase } = await requireUser();

  // Traer URL antes de borrar (para storage y cover)
  const { data: row } = await supabase
    .from("articulos_media")
    .select("id, url")
    .eq("id", mediaId)
    .maybeSingle();

  const { error } = await supabase
    .from("articulos_media")
    .delete()
    .eq("id", mediaId);

  if (error) {
    console.error("deleteMedia:", error.message);
    return { error: error.message };
  }

  // Si era la portada, poner la siguiente foto o null
  if (row?.url) {
    const { data: art } = await supabase
      .from("articulos_categoria")
      .select("cover_image, slug")
      .eq("id", articleId)
      .maybeSingle();

    if (art?.cover_image === row.url) {
      const { data: next } = await supabase
        .from("articulos_media")
        .select("url")
        .eq("articulo_id", articleId)
        .order("order", { ascending: true })
        .limit(1)
        .maybeSingle();

      await supabase
        .from("articulos_categoria")
        .update({ cover_image: next?.url ?? null })
        .eq("id", articleId);
    }

    // Intentar borrar del bucket (path después de /case-media/)
    try {
      const marker = "/case-media/";
      const idx = row.url.indexOf(marker);
      if (idx !== -1) {
        const path = row.url.slice(idx + marker.length);
        await supabase.storage.from("case-media").remove([path]);
      }
    } catch {
      // no bloquear si falla el storage
    }
  }

  revalidatePath(`/admin/articulos/${articleId}/editar`);
  revalidatePath("/catalogo");
  revalidatePath("/productos");
  return {};
}

export async function setCoverFromMedia(
  mediaId: number | string,
  articleId: number | string
): Promise<{ error?: string }> {
  const { supabase } = await requireUser();

  const { data: row, error: fetchErr } = await supabase
    .from("articulos_media")
    .select("url")
    .eq("id", mediaId)
    .maybeSingle();

  if (fetchErr || !row?.url) {
    return { error: fetchErr?.message ?? "Foto no encontrada." };
  }

  const { error } = await supabase
    .from("articulos_categoria")
    .update({ cover_image: row.url })
    .eq("id", articleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/articulos/${articleId}/editar`);
  revalidatePath("/catalogo");
  revalidatePath("/productos");
  return {};
}
