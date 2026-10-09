"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Genera un slug único a partir del título. Si ya existe, agrega -2, -3, … */
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

// ── Seguridad: verificación de sesión en cada acción ────────────────
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
  if (fields.description.length > 2000) return "La descripción no puede superar los 2000 caracteres.";
  if (fields.price.length > 50) return "El precio no puede superar los 50 caracteres.";
  // category_id es opcional (puede ser null)
  return null;
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

  revalidatePath("/admin");
  revalidatePath("/admin/articulos");
  redirect(
    `/admin/articulos?success=${encodeURIComponent(
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

  const { data: previous } = await supabase
    .from("articulos_categoria")
    .select("slug")
    .eq("id", articleId)
    .single();

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
  redirect(
    `/admin/articulos?success=${encodeURIComponent(
      `Artículo "${fields.title}" guardado correctamente.`
    )}`
  );
}

export async function deleteArticle(articleId: number) {
  const { supabase } = await requireUser();
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

// ── Cover image (usa el mismo bucket case-media) ─────────────────────

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export async function uploadCoverImage(articleId: number, formData: FormData) {
  const { supabase } = await requireUser();
  const editarUrl = `/admin/articulos/${articleId}/editar`;

  const file = formData.get("cover") as File | null;
  if (!file || file.size === 0) {
    redirect(`${editarUrl}?error=${encodeURIComponent("No se seleccionó ninguna imagen.")}`);
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    redirect(
      `${editarUrl}?error=${encodeURIComponent(
        "Tipo de archivo no permitido. Solo se aceptan JPG, PNG, WebP, GIF o AVIF."
      )}`
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    redirect(
      `${editarUrl}?error=${encodeURIComponent(
        "La imagen supera el límite de 8 MB."
      )}`
    );
  }

  const path = `articulos/${articleId}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("case-media")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    redirect(
      `${editarUrl}?error=${encodeURIComponent(
        `Error al subir la imagen: ${uploadError.message}`
      )}`
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("case-media").getPublicUrl(path);

  // Si había una imagen anterior, intentamos borrarla del storage
  const { data: current } = await supabase
    .from("articulos_categoria")
    .select("cover_image")
    .eq("id", articleId)
    .single();

  if (current?.cover_image) {
    try {
      // Extraemos el path relativo del bucket a partir de la URL pública
      const url = new URL(current.cover_image);
      const marker = "/case-media/";
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const oldPath = url.pathname.slice(idx + marker.length);
        await supabase.storage.from("case-media").remove([oldPath]);
      }
    } catch {
      // Si falla el parseo o el borrado, no bloqueamos la actualización
    }
  }

  const { error: updateError } = await supabase
    .from("articulos_categoria")
    .update({ cover_image: publicUrl })
    .eq("id", articleId);

  if (updateError) {
    redirect(
      `${editarUrl}?error=${encodeURIComponent(
        `Imagen subida pero no se pudo guardar en el artículo: ${updateError.message}`
      )}`
    );
  }

  revalidatePath(editarUrl);
  revalidatePath("/admin/articulos");
  revalidatePath("/admin");
  redirect(
    `${editarUrl}?success=${encodeURIComponent("Imagen de portada actualizada.")}`
  );
}

export async function removeCoverImage(articleId: number) {
  const { supabase } = await requireUser();
  const editarUrl = `/admin/articulos/${articleId}/editar`;

  const { data: current } = await supabase
    .from("articulos_categoria")
    .select("cover_image")
    .eq("id", articleId)
    .single();

  if (current?.cover_image) {
    try {
      const url = new URL(current.cover_image);
      const marker = "/case-media/";
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const oldPath = url.pathname.slice(idx + marker.length);
        await supabase.storage.from("case-media").remove([oldPath]);
      }
    } catch {
      // ignoramos errores de borrado de storage
    }
  }

  await supabase
    .from("articulos_categoria")
    .update({ cover_image: null })
    .eq("id", articleId);

  revalidatePath(editarUrl);
  revalidatePath("/admin/articulos");
  revalidatePath("/admin");
  redirect(
    `${editarUrl}?success=${encodeURIComponent("Imagen de portada eliminada.")}`
  );
}
