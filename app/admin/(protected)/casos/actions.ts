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
  excludeCaseId?: string
): Promise<string> {
  const base = slugify(title) || "caso";
  let candidate = base;
  let n = 2;

  for (;;) {
    let query = supabase.from("servicios").select("id").eq("slug", candidate);
    if (excludeCaseId) {
      query = query.neq("id", excludeCaseId);
    }
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 50) return `${base}-${Date.now()}`;
  }
}

// ── Seguridad: verificación de sesión en cada acción ────────────────
// El middleware (lib/supabase/middleware.ts) ya bloquea la NAVEGACIÓN
// a páginas de /admin sin sesión. Pero una Server Action es, en los
// hechos, un endpoint HTTP propio: alguien podría intentar invocarla
// directamente sin pasar por la página. Por eso cada acción vuelve a
// comprobar acá, del lado del servidor, que hay un usuario logueado
// antes de tocar la base de datos. Es "defensa en profundidad": ni el
// middleware ni esta comprobación dependen del código del navegador,
// que cualquiera puede modificar o saltear.
//
// Además, la base de datos tiene su propia política de seguridad
// (RLS, en supabase/schema.sql) que rechaza escrituras sin sesión
// aunque este chequeo fallara. Son tres capas independientes.
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

interface CaseFormFields {
  title: string;
  subtitle: string;
  excerpt: string;
  category_id: string;
  tipo_servicio_id: string;
  content: string;
  technical_description: string;
  cause: string;
  consequences: string;
  solution: string;
  estimated_cost: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
  tags: string; // separadas por coma, tal como las escribe el admin
}

function readFields(formData: FormData): CaseFormFields {
  return {
    title: (formData.get("title") as string) ?? "",
    subtitle: (formData.get("subtitle") as string) ?? "",
    excerpt: (formData.get("excerpt") as string) ?? "",
    category_id: (formData.get("category_id") as string) ?? "",
    tipo_servicio_id: (formData.get("tipo_servicio_id") as string) ?? "",
    content: (formData.get("content") as string) ?? "",
    technical_description: (formData.get("technical_description") as string) ?? "",
    cause: (formData.get("cause") as string) ?? "",
    consequences: (formData.get("consequences") as string) ?? "",
    solution: (formData.get("solution") as string) ?? "",
    estimated_cost: (formData.get("estimated_cost") as string) ?? "",
    seo_title: (formData.get("seo_title") as string) ?? "",
    seo_description: (formData.get("seo_description") as string) ?? "",
    published: formData.get("published") === "on",
    tags: (formData.get("tags") as string) ?? "",
  };
}

// Validación mínima de los campos obligatorios. No reemplaza las
// restricciones "not null" de la base de datos (esas son la última
// línea de defensa), pero evita que un formulario vacío o manipulado
// llegue a generar un registro con un slug vacío como "".
function validateFields(fields: CaseFormFields): string | null {
  if (!fields.title.trim()) return "El título es obligatorio.";
  if (fields.title.length > 200) return "El título es demasiado largo (máx. 200 caracteres).";
  if (!fields.category_id) return "Tenés que elegir una categoría.";
  if (!fields.tipo_servicio_id) return "Elige un tipo de servicio";
  return null;
}

async function syncTags(caseId: string, tagsRaw: string) {
  const supabase = await createClient();
  const names = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 30); // límite razonable: evita cargas masivas accidentales o maliciosas

  await supabase.from("case_tags").delete().eq("case_id", caseId);

  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;

    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const tagId =
      existing?.id ??
      (await supabase.from("tags").insert({ name, slug }).select("id").single()).data?.id;

    if (tagId) {
      await supabase.from("case_tags").insert({ case_id: caseId, tag_id: tagId });
    }
  }
}

export async function createCase(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const fields = readFields(formData);

  const validationError = validateFields(fields);
  if (validationError) {
    redirect(`/admin/casos/nuevo?error=${encodeURIComponent(validationError)}`);
  }

  // Slug automático a partir del título (único en la tabla)
  const slug = await uniqueSlug(supabase, fields.title);

  const { data, error } = await supabase
    .from("servicios")
    .insert({ ...fields, tags: undefined, slug })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/admin/casos/nuevo?error=${encodeURIComponent(error?.message ?? "Error desconocido al crear el caso.")}`);
  }

  await syncTags(data.id, fields.tags);

  revalidatePath("/admin");
  revalidatePath("/Servicios");
  revalidatePath(`/Servicios/${slug}`);
  redirect("/admin?success=" + encodeURIComponent(`Caso "${fields.title}" creado correctamente.`));
}

export async function updateCase(caseId: string, formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const fields = readFields(formData);

  const validationError = validateFields(fields);
  if (validationError) {
    redirect(`/admin/casos/${caseId}/editar?error=${encodeURIComponent(validationError)}`);
  }

  // Slug anterior (para revalidar la URL vieja si cambió el título)
  const { data: previous } = await supabase
    .from("servicios")
    .select("slug")
    .eq("id", caseId)
    .single();

  // Regenerar slug siempre a partir del título actual
  const slug = await uniqueSlug(supabase, fields.title, caseId);

  const { error } = await supabase
    .from("servicios")
    .update({ ...fields, tags: undefined, slug })
    .eq("id", caseId);

  if (error) {
    redirect(`/admin/casos/${caseId}/editar?error=${encodeURIComponent(error.message)}`);
  }

  await syncTags(caseId, fields.tags);

  revalidatePath("/admin");
  revalidatePath("/Servicios");
  revalidatePath(`/Servicios/${slug}`);
  if (previous?.slug && previous.slug !== slug) {
    revalidatePath(`/Servicios/${previous.slug}`);
  }
  redirect("/admin?success=" + encodeURIComponent(`Caso "${fields.title}" guardado correctamente.`));
}

export async function deleteCase(caseId: string) {
  const { supabase } = await requireUser();
  await supabase.from("servicios").delete().eq("id", caseId);
  revalidatePath("/admin");
  revalidatePath("/Servicios");
}

export async function togglePublish(caseId: string, published: boolean) {
  const { supabase } = await requireUser();
  await supabase.from("servicios").update({ published: !published }).eq("id", caseId);
  revalidatePath("/admin");
  revalidatePath("/Servicios");
}

// ── Seguridad: qué archivos aceptamos y cuáles no ───────────────────
// No confiamos en el <select> "Imagen / Vídeo" del formulario (es
// solo una etiqueta que el visitante del formulario podría cambiar):
// verificamos el tipo MIME real que el navegador reporta para el
// archivo. Cualquier tipo fuera de esta lista se rechaza, para que
// nadie pueda subir, por ejemplo, un .html o .svg con script adentro
// y hacerlo pasar por "imagen".
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 15 MB — igual al límite de Server Actions en next.config.js

// Sube una imagen o vídeo al bucket "case-media" y crea el registro
// correspondiente en la tabla media.
export async function uploadMedia(caseId: string, formData: FormData) {
  const { supabase } = await requireUser();
  // Soporta uno o muchos archivos: <input name="file" multiple />
  const rawFiles = formData.getAll("file");
  const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);
  const alt = ((formData.get("alt") as string) ?? "").slice(0, 300);
  const caption = ((formData.get("caption") as string) ?? "").slice(0, 500);

  const editarUrl = `/admin/casos/${caseId}/editar`;

  if (files.length === 0) {
    redirect(`${editarUrl}?error=${encodeURIComponent("No se seleccionó ningún archivo.")}`);
  }

  const errors: string[] = [];
  let uploaded = 0;
  let firstImageUrl: string | null = null;

  for (const file of files) {
    const isImage = file.type in ALLOWED_IMAGE_TYPES;
    const isVideo = file.type in ALLOWED_VIDEO_TYPES;

    if (!isImage && !isVideo) {
      errors.push(`"${file.name}": tipo no permitido.`);
      continue;
    }

    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (file.size > maxBytes) {
      errors.push(
        `"${file.name}": supera el máximo de ${Math.round(maxBytes / (1024 * 1024))} MB.`
      );
      continue;
    }

    const type = isVideo ? "video" : "image";
    const extension = ALLOWED_IMAGE_TYPES[file.type] ?? ALLOWED_VIDEO_TYPES[file.type];
    const path = `${caseId}/${Date.now()}-${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("case-media")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      errors.push(`"${file.name}": error en Storage (${uploadError.message}).`);
      continue;
    }

    const { data: publicUrlData } = supabase.storage.from("case-media").getPublicUrl(path);

    const { error: insertError } = await supabase.from("media").insert({
      case_id: caseId,
      type,
      url: publicUrlData.publicUrl,
      alt,
      caption,
      order: 0,
    });

    if (insertError) {
      errors.push(`"${file.name}": subido pero no guardado en BD (${insertError.message}).`);
      continue;
    }

    uploaded += 1;
    if (isImage && !firstImageUrl) {
      firstImageUrl = publicUrlData.publicUrl;
    }
  }

  // Primera imagen del lote como portada si el caso no tiene ninguna
  if (firstImageUrl) {
    const { data: currentCase } = await supabase
      .from("servicios")
      .select("cover_image")
      .eq("id", caseId)
      .single();

    if (!currentCase?.cover_image) {
      await supabase
        .from("servicios")
        .update({ cover_image: firstImageUrl })
        .eq("id", caseId);
    }
  }

  revalidatePath(editarUrl);
  revalidatePath("/Servicios");
  revalidatePath("/");

  if (uploaded === 0) {
    redirect(
      `${editarUrl}?error=${encodeURIComponent(
        errors.length > 0 ? errors.join(" ") : "No se pudo subir ningún archivo."
      )}`
    );
  }

  const okMsg =
    uploaded === 1
      ? "1 archivo subido correctamente."
      : `${uploaded} archivos subidos correctamente.`;
  const warn = errors.length > 0 ? ` Algunos fallaron: ${errors.join(" ")}` : "";
  redirect(`${editarUrl}?success=${encodeURIComponent(okMsg + warn)}`);
}

/**
 * Enlaza un vídeo externo (YouTube o Vimeo) sin subirlo a Storage.
 * Guardamos el ID del vídeo en media.url y type='video'.
 * El VideoPlayer del sitio público espera exactamente ese ID (o "vimeo:ID").
 */
function extractVideoId(rawUrl: string): { provider: "youtube" | "vimeo"; id: string } | null {
  const url = rawUrl.trim();
  if (!url) return null;

  // YouTube: watch?v=, youtu.be/, embed/, shorts/
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*\bv=([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of ytPatterns) {
    const m = url.match(re);
    if (m?.[1]) return { provider: "youtube", id: m[1] };
  }

  // Vimeo: vimeo.com/123456789 o player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch?.[1]) return { provider: "vimeo", id: vimeoMatch[1] };

  // Si el usuario pegó solo el ID de 11 caracteres de YouTube
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return { provider: "youtube", id: url };
  }

  return null;
}

export async function addExternalVideo(caseId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const rawUrl = ((formData.get("video_url") as string) ?? "").trim();
  const alt = ((formData.get("alt") as string) ?? "").slice(0, 300);
  const caption = ((formData.get("caption") as string) ?? "").slice(0, 500);

  const editarUrl = `/admin/casos/${caseId}/editar`;

  const extracted = extractVideoId(rawUrl);
  if (!extracted) {
    redirect(
      `${editarUrl}?error=${encodeURIComponent(
        "URL de vídeo no reconocida. Pegá un enlace de YouTube (youtube.com/watch?v=... o youtu.be/...) o de Vimeo."
      )}`
    );
  }

  // Guardamos el ID puro. VideoPlayer construye el embed a partir de él.
  // Prefijamos con el provider para que el player sepa qué servicio usar.
  const storageValue =
    extracted.provider === "youtube" ? extracted.id : `vimeo:${extracted.id}`;

  // Orden: ponerlo al final de los medios existentes
  const { data: existing } = await supabase
    .from("media")
    .select("order")
    .eq("case_id", caseId)
    .order("order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order ?? -1) + 1;

  const { error } = await supabase.from("media").insert({
    case_id: caseId,
    type: "video",
    url: storageValue,
    alt: alt || `Vídeo ${extracted.provider}`,
    caption: caption || null,
    order: nextOrder,
  });

  if (error) {
    redirect(
      `${editarUrl}?error=${encodeURIComponent(`No se pudo guardar el vídeo: ${error.message}`)}`
    );
  }

  revalidatePath(editarUrl);
  revalidatePath("/Servicios");
  redirect(
    `${editarUrl}?success=${encodeURIComponent(
      `Vídeo de ${extracted.provider === "youtube" ? "YouTube" : "Vimeo"} enlazado correctamente.`
    )}`
  );
}

export async function deleteMedia(mediaId: string, caseId: string) {
  const { supabase } = await requireUser();
  const editarUrl = `/admin/casos/${caseId}/editar`;

  // Si borramos la imagen que era la principal, liberamos cover_image
  const { data: mediaRow } = await supabase
    .from("media")
    .select("url")
    .eq("id", mediaId)
    .maybeSingle();

  await supabase.from("media").delete().eq("id", mediaId);

  if (mediaRow?.url) {
    const { data: caso } = await supabase
      .from("servicios")
      .select("cover_image, slug")
      .eq("id", caseId)
      .single();

    if (caso?.cover_image === mediaRow.url) {
      await supabase.from("servicios").update({ cover_image: null }).eq("id", caseId);
      if (caso.slug) revalidatePath(`/Servicios/${caso.slug}`);
    }
  }

  revalidatePath(editarUrl);
  revalidatePath("/Servicios");
  revalidatePath("/");
}

// Marca una imagen ya subida como la imagen principal (cover_image)
// del caso, para que se muestre en la cabecera y en las tarjetas.
export async function setCoverImage(caseId: string, url: string) {
  const { supabase } = await requireUser();
  const editarUrl = `/admin/casos/${caseId}/editar`;

  const { data: caso } = await supabase
    .from("servicios")
    .update({ cover_image: url })
    .eq("id", caseId)
    .select("slug")
    .single();

  revalidatePath(editarUrl);
  revalidatePath("/Servicios");
  revalidatePath("/");
  if (caso?.slug) {
    revalidatePath(`/Servicios/${caso.slug}`);
  }

  redirect(
    `${editarUrl}?success=${encodeURIComponent("Imagen principal actualizada.")}`
  );
}

export async function addRegulation(caseId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const name = ((formData.get("reg_name") as string) ?? "").trim().slice(0, 100);
  const description = ((formData.get("reg_description") as string) ?? "").slice(0, 1000);
  const url = ((formData.get("reg_url") as string) ?? "").trim().slice(0, 500);

  const editarUrl = `/admin/casos/${caseId}/editar`;

  if (!name) {
    redirect(`${editarUrl}?error=${encodeURIComponent("El código de normativa es obligatorio.")}`);
  }

  // Si se cargó una URL, tiene que ser una URL de verdad (http/https).
  // Esto evita, por ejemplo, un "javascript:" pegado por error que
  // termine convirtiéndose en un enlace clicable en la web pública.
  if (url) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("protocolo no permitido");
    } catch {
      redirect(`${editarUrl}?error=${encodeURIComponent("La URL de la normativa no es válida (tiene que empezar con http:// o https://).")}`);
    }
  }

  const { error } = await supabase.from("regulations").insert({ case_id: caseId, name, description, url });

  if (error) {
    redirect(`${editarUrl}?error=${encodeURIComponent(`Error al guardar normativa: ${error.message}`)}`);
  }

  revalidatePath(editarUrl);
}

export async function deleteRegulation(regulationId: string, caseId: string) {
  const { supabase } = await requireUser();
  await supabase.from("regulations").delete().eq("id", regulationId);
  revalidatePath(`/admin/casos/${caseId}/editar`);
}
