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
  excludeId?: number
): Promise<string> {
  const base = slugify(title) || "articulo";
  let candidate = base;
  let n = 2;

  for (;;) {
    let query = supabase
      .from("articulos_categoria")
      .select("id")
      .eq("slug", candidate);
    if (excludeId !== undefined) {
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

interface ArticleFormFields {
  title: string;
  description: string;
  price: string;
  category_id: string;
  published: boolean;
}

function readFields(formData: FormData): ArticleFormFields {
  return {
    title: ((formData.get("title") as string) ?? "").trim(),
    description: ((formData.get("description") as string) ?? "").trim(),
    price: ((formData.get("price") as string) ?? "").trim(),
    category_id: ((formData.get("category_id") as string) ?? "").trim(),
    published: formData.get("published") === "on" || formData.get("published") === "true",
  };
}

function validateFields(fields: ArticleFormFields): string | null {
  if (!fields.title) return "El título es obligatorio.";
  if (fields.title.length > 200) return "El título no puede superar los 200 caracteres.";
  if (fields.description.length > 2000)
    return "La descripción no puede superar los 2000 caracteres.";
  if (fields.price.length > 50) return "El precio no puede superar los 50 caracteres.";
  return null;
}

async function tryDeleteStorageFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  publicUrl: string | null | undefined
) {
  if (!publicUrl) return;
  try {
    const url = new URL(publicUrl);
    const marker = "/case-media/";
    const idx = url.pathname.indexOf(marker);
    if (idx !== -1) {
      const path = url.pathname.slice(idx + marker.length);
      await supabase.storage.from("case-media").remove([path]);
    }
  } catch {
    // no bloqueamos
  }
}

// ── CRUD principal (sin archivos por Server Action) ─────────────────

export async function createArticle(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const fields = readFields(formData);

  const validationError = validateFields(fields);
  if (validationError) {
    redirect(`/admin/articulos/nuevo?error=${encodeURIComponent(validationError)}`);
  }

  const slug = await uniqueSlug(supabase, fields.title);

  const { data, error } = await supabase
    .from("articulos_categoria")
    .insert({
      title: fields.title,
      slug,
      description: fields.description || null,
      price: fields.price || null,
      category_id: fields.category_id || null,
      published: fields.published,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      `/admin/articulos/nuevo?error=${encodeURIComponent(
        error?.message ?? "Error desconocido al crear el artículo."
      )}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articulos");
  redirect(
    `/admin/articulos/${data.id}/editar?success=${encodeURIComponent(
      `Artículo "${fields.title}" creado. Ahora podés subir las fotos.`
    )}`
  );
}

export async function updateArticle(articleId: number, formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const fields = readFields(formData);

  const validationError = validateFields(fields);
  if (validationError) {
    redirect(
      `/admin/articulos/${articleId}/editar?error=${encodeURIComponent(validationError)}`
    );
  }

  const slug = await uniqueSlug(supabase, fields.title, articleId);

  const { error } = await supabase
    .from("articulos_categoria")
    .update({
      title: fields.title,
      slug,
      description: fields.description || null,
      price: fields.price || null,
      category_id: fields.category_id || null,
      published: fields.published,
    })
    .eq("id", articleId);

  if (error) {
    redirect(
      `/admin/articulos/${articleId}/editar?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articulos");
  revalidatePath(`/admin/articulos/${articleId}/editar`);
  revalidatePath(`/catalogo/${slug}`);
  redirect(
    `/admin/articulos/${articleId}/editar?success=${encodeURIComponent(
      `Artículo "${fields.title}" guardado correctamente.`
    )}`
  );
}

export async function deleteArticle(articleId: number) {
  const { supabase } = await requireUser();

  const { data: mediaRows } = await supabase
    .from("articulos_media")
    .select("url")
    .eq("articulo_id", articleId);

  for (const row of mediaRows ?? []) {
    await tryDeleteStorageFile(supabase, row.url);
  }

  const { data: article } = await supabase
    .from("articulos_categoria")
    .select("cover_image")
    .eq("id", articleId)
    .maybeSingle();

  if (article?.cover_image) {
    await tryDeleteStorageFile(supabase, article.cover_image);
  }

  await supabase.from("articulos_categoria").delete().eq("id", articleId);
  revalidatePath("/admin");
  revalidatePath("/admin/articulos");
}

export async function togglePublish(articleId: number, published: boolean) {
  const { supabase } = await requireUser();
  await supabase
    .from("articulos_categoria")
    .update({ published: !published })
    .eq("id", articleId);
  revalidatePath("/admin");
  revalidatePath("/admin/articulos");
}

// ── Media: solo metadatos (el archivo ya está en Storage vía cliente) ─

/** Registra una foto ya subida por el cliente. Devuelve { id } o { error }. */
export async function registerMedia(payload: {
  articleId: number;
  url: string;
  alt?: string;
  order?: number;
}): Promise<{ id?: number; error?: string }> {
  const { supabase } = await requireUser();
  const { articleId, url, alt, order = 0 } = payload;

  if (!url || !articleId) {
    return { error: "Datos incompletos." };
  }

  const { data, error } = await supabase
    .from("articulos_media")
    .insert({
      articulo_id: articleId,
      url,
      alt: alt ?? null,
      order,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "No se pudo registrar la foto." };
  }

  const { data: art } = await supabase
    .from("articulos_categoria")
    .select("cover_image")
    .eq("id", articleId)
    .single();

  if (!art?.cover_image) {
    await supabase
      .from("articulos_categoria")
      .update({ cover_image: url })
      .eq("id", articleId);
  }

  revalidatePath(`/admin/articulos/${articleId}/editar`);
  revalidatePath("/admin/articulos");
  return { id: data.id };
}

/** Elimina registro + archivo de Storage. */
export async function deleteMedia(
  mediaId: number,
  articleId: number
): Promise<{ error?: string }> {
  const { supabase } = await requireUser();

  const { data: row } = await supabase
    .from("articulos_media")
    .select("url")
    .eq("id", mediaId)
    .maybeSingle();

  const { error } = await supabase
    .from("articulos_media")
    .delete()
    .eq("id", mediaId);

  if (error) {
    return { error: error.message };
  }

  if (row?.url) {
    await tryDeleteStorageFile(supabase, row.url);

    const { data: art } = await supabase
      .from("articulos_categoria")
      .select("cover_image")
      .eq("id", articleId)
      .single();

    if (art?.cover_image === row.url) {
      const { data: remaining } = await supabase
        .from("articulos_media")
        .select('url, "order"')
        .eq("articulo_id", articleId);

      const sorted = ((remaining ?? []) as { url: string; order?: number }[])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      await supabase
        .from("articulos_categoria")
        .update({ cover_image: sorted[0]?.url ?? null })
        .eq("id", articleId);
    }
  }

  revalidatePath(`/admin/articulos/${articleId}/editar`);
  revalidatePath("/admin/articulos");
  return {};
}

/** Marca una foto de la galería como cover_image. */
export async function setCoverFromMedia(
  mediaId: number,
  articleId: number
): Promise<{ error?: string }> {
  const { supabase } = await requireUser();

  const { data: row } = await supabase
    .from("articulos_media")
    .select("url")
    .eq("id", mediaId)
    .eq("articulo_id", articleId)
    .maybeSingle();

  if (!row?.url) {
    return { error: "Foto no encontrada." };
  }

  const { error } = await supabase
    .from("articulos_categoria")
    .update({ cover_image: row.url })
    .eq("id", articleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/articulos/${articleId}/editar`);
  revalidatePath("/admin/articulos");
  return {};
}
