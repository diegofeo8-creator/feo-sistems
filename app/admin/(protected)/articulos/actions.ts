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

  const { error } = await supabase
    .from("articulos_categoria")
    .update({
      title: fields.title,
      description: fields.description || null,
      price: fields.price || null,
      cover_image: fields.cover_image,
      category_id: fields.category_id,
      published: fields.published,
      slug,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articuloId);

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
