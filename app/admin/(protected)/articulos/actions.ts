"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
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

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

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

async function uploadFileToStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  articleId: number,
  file: File
): Promise<{ url: string } | { error: string }> {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return {
      error: `"${file.name}": tipo no permitido. Solo JPG, PNG, WebP, GIF o AVIF.`,
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `"${file.name}": supera el límite de 8 MB.` };
  }

  const path = `articulos/${articleId}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("case-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { error: `"${file.name}": ${error.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("case-media").getPublicUrl(path);

  return { url: publicUrl };
}

// ── CRUD principal ──────────────────────────────────────────────────

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

  const rawFiles = formData.getAll("cover");
  const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);

  let firstUrl: string | null = null;
  let order = 0;

  for (const file of files) {
    const result = await uploadFileToStorage(supabase, data.id, file);
    if ("error" in result) continue;

    await supabase.from("articulos_media").insert({
      articulo_id: data.id,
      url: result.url,
      alt: fields.title,
      order,
    });

    if (!firstUrl) firstUrl = result.url;
    order += 1;
  }

  if (firstUrl) {
    await supabase
      .from("articulos_categoria")
      .update({ cover_image: firstUrl })
      .eq("id", data.id);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articulos");
  redirect(
    `/admin/articulos/${data.id}/editar?success=${encodeURIComponent(
      `Artículo "${fields.title}" creado correctamente.`
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

// ── Galería de fotos (articulos_media) ───────────────────────────────

export async function uploadMedia(articleId: number, formData: FormData) {
  const { supabase } = await requireUser();
  const editarUrl = `/admin/articulos/${articleId}/editar`;

  const rawFiles = formData.getAll("files");
  const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    redirect(`${editarUrl}?error=${encodeURIComponent("No se seleccionó ninguna imagen.")}`);
  }

  const { data: existing } = await supabase
    .from("articulos_media")
    .select("order")
    .eq("articulo_id", articleId)
    .order("order", { ascending: false })
    .limit(1);

  let nextOrder = (existing?.[0]?.order ?? -1) + 1;
  const errors: string[] = [];
  let uploaded = 0;
  let firstNewUrl: string | null = null;

  for (const file of files) {
    const result = await uploadFileToStorage(supabase, articleId, file);
    if ("error" in result) {
      errors.push(result.error);
      continue;
    }

    const { error: insertError } = await supabase.from("articulos_media").insert({
      articulo_id: articleId,
      url: result.url,
      alt: file.name.replace(/\.[^.]+$/, ""),
      order: nextOrder,
    });

    if (insertError) {
      errors.push(`${file.name}: ${insertError.message}`);
      continue;
    }

    if (!firstNewUrl) firstNewUrl = result.url;
    uploaded += 1;
    nextOrder += 1;
  }

  if (firstNewUrl) {
    const { data: art } = await supabase
      .from("articulos_categoria")
      .select("cover_image")
      .eq("id", articleId)
      .single();

    if (!art?.cover_image) {
      await supabase
        .from("articulos_categoria")
        .update({ cover_image: firstNewUrl })
        .eq("id", articleId);
    }
  }

  revalidatePath(editarUrl);
  revalidatePath("/admin/articulos");

  if (uploaded === 0) {
    redirect(
      `${editarUrl}?error=${encodeURIComponent(
        errors.length > 0 ? errors.join(" ") : "No se pudo subir ningún archivo."
      )}`
    );
  }

  const okMsg =
    uploaded === 1
      ? "1 foto subida correctamente."
      : `${uploaded} fotos subidas correctamente.`;
  const warn = errors.length > 0 ? ` Algunas fallaron: ${errors.join(" ")}` : "";
  redirect(`${editarUrl}?success=${encodeURIComponent(okMsg + warn)}`);
}

export async function deleteMedia(mediaId: number, articleId: number) {
  const { supabase } = await requireUser();
  const editarUrl = `/admin/articulos/${articleId}/editar`;

  const { data: row } = await supabase
    .from("articulos_media")
    .select("url")
    .eq("id", mediaId)
    .maybeSingle();

  await supabase.from("articulos_media").delete().eq("id", mediaId);

  if (row?.url) {
    await tryDeleteStorageFile(supabase, row.url);

    const { data: art } = await supabase
      .from("articulos_categoria")
      .select("cover_image")
      .eq("id", articleId)
      .single();

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
  }

  revalidatePath(editarUrl);
  revalidatePath("/admin/articulos");
  redirect(`${editarUrl}?success=${encodeURIComponent("Foto eliminada.")}`);
}

export async function setCoverFromMedia(mediaId: number, articleId: number) {
  const { supabase } = await requireUser();
  const editarUrl = `/admin/articulos/${articleId}/editar`;

  const { data: row } = await supabase
    .from("articulos_media")
    .select("url")
    .eq("id", mediaId)
    .eq("articulo_id", articleId)
    .maybeSingle();

  if (!row?.url) {
    redirect(`${editarUrl}?error=${encodeURIComponent("Foto no encontrada.")}`);
  }

  await supabase
    .from("articulos_categoria")
    .update({ cover_image: row.url })
    .eq("id", articleId);

  revalidatePath(editarUrl);
  revalidatePath("/admin/articulos");
  redirect(
    `${editarUrl}?success=${encodeURIComponent("Imagen principal actualizada.")}`
  );
}
