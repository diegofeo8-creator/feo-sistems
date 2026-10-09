"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  registerMedia,
  deleteMedia,
  setCoverFromMedia,
} from "@/app/admin/(protected)/articulos/actions";

type Photo = {
  id: number;
  url: string;
  alt: string | null;
  order?: number;
};

interface Props {
  articleId: number;
  coverImage: string | null;
  photos: Photo[];
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB por archivo (límite razonable del bucket)

function extFromMime(type: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  return map[type] ?? "jpg";
}

export default function ArticleMediaManager({
  articleId,
  coverImage,
  photos: initialPhotos,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [cover, setCover] = useState<string | null>(coverImage);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) => f.size > 0);
    e.target.value = ""; // permitir re-seleccionar el mismo archivo

    if (files.length === 0) return;

    setStatus(null);
    setUploading(true);

    const supabase = createClient();
    const errors: string[] = [];
    const newPhotos: Photo[] = [];
    let nextOrder =
      photos.reduce((max, p) => Math.max(max, p.order ?? 0), -1) + 1;

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}": tipo no permitido.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`"${file.name}": supera 15 MB.`);
        continue;
      }

      const ext = extFromMime(file.type);
      const path = `articulos/${articleId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("case-media")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (upErr) {
        errors.push(`"${file.name}": ${upErr.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("case-media").getPublicUrl(path);

      // Registrar en DB vía Server Action (solo la URL, sin el archivo)
      try {
        const result = await registerMedia({
          articleId,
          url: publicUrl,
          alt: file.name.replace(/\.[^.]+$/, ""),
          order: nextOrder,
        });

        if (result.error) {
          errors.push(`"${file.name}": ${result.error}`);
          // intentar limpiar el storage
          await supabase.storage.from("case-media").remove([path]);
          continue;
        }

        newPhotos.push({
          id: result.id!,
          url: publicUrl,
          alt: file.name.replace(/\.[^.]+$/, ""),
          order: nextOrder,
        });
        nextOrder += 1;
      } catch (err) {
        errors.push(
          `"${file.name}": ${err instanceof Error ? err.message : "error al registrar"}`
        );
        await supabase.storage.from("case-media").remove([path]);
      }
    }

    if (newPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...newPhotos]);
      // Si no había cover, la primera subida pasa a ser principal
      if (!cover && newPhotos[0]) {
        setCover(newPhotos[0].url);
      }
    }

    setUploading(false);

    if (newPhotos.length > 0 && errors.length === 0) {
      setStatus({
        type: "ok",
        msg:
          newPhotos.length === 1
            ? "1 foto subida correctamente."
            : `${newPhotos.length} fotos subidas correctamente.`,
      });
    } else if (newPhotos.length > 0 && errors.length > 0) {
      setStatus({
        type: "ok",
        msg: `${newPhotos.length} subidas. Algunas fallaron: ${errors.join(" ")}`,
      });
    } else {
      setStatus({
        type: "err",
        msg: errors.length > 0 ? errors.join(" ") : "No se pudo subir ningún archivo.",
      });
    }
  }

  function handleSetCover(mediaId: number, url: string) {
    startTransition(async () => {
      setStatus(null);
      const result = await setCoverFromMedia(mediaId, articleId);
      if (result?.error) {
        setStatus({ type: "err", msg: result.error });
      } else {
        setCover(url);
        setStatus({ type: "ok", msg: "Imagen principal actualizada." });
      }
    });
  }

  function handleDelete(mediaId: number, url: string) {
    if (!confirm("¿Eliminar esta foto?")) return;

    startTransition(async () => {
      setStatus(null);
      const result = await deleteMedia(mediaId, articleId);
      if (result?.error) {
        setStatus({ type: "err", msg: result.error });
        return;
      }
      setPhotos((prev) => prev.filter((p) => p.id !== mediaId));
      if (cover === url) {
        // el server ya eligió la siguiente; actualizamos optimista
        const remaining = photos.filter((p) => p.id !== mediaId);
        setCover(remaining[0]?.url ?? null);
      }
      setStatus({ type: "ok", msg: "Foto eliminada." });
    });
  }

  const busy = uploading || isPending;

  return (
    <div className="max-w-3xl border-t border-border pt-8">
      <h2 className="font-heading font-bold text-xl mb-2">
        Fotos del producto ({photos.length})
      </h2>
      <p className="text-muted text-sm mb-6">
        Las fotos se suben directo a Supabase (sin límite de Vercel). Podés
        elegir varias a la vez. La principal se muestra en las tarjetas.
      </p>

      {status && (
        <p
          className={`text-sm rounded-sm px-4 py-3 mb-4 ${
            status.type === "ok"
              ? "bg-accent/10 border border-accent/40 text-accent"
              : "bg-red-950/40 border border-red-400/40 text-red-300"
          }`}
        >
          {status.msg}
        </p>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {photos.map((photo) => {
            const isCover = cover === photo.url;
            return (
              <div
                key={photo.id}
                className={`relative group rounded-sm border overflow-hidden ${
                  isCover
                    ? "border-accent ring-1 ring-accent/40"
                    : "border-border"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.alt ?? ""}
                  className="w-full aspect-square object-cover"
                />
                {isCover && (
                  <span className="absolute top-1 left-1 bg-accent text-bg text-[10px] font-heading font-semibold px-1.5 py-0.5 rounded-sm">
                    Principal
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-bg/90 p-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isCover && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSetCover(photo.id, photo.url)}
                      className="text-[10px] font-heading text-paper hover:text-accent px-1 disabled:opacity-50"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(photo.id, photo.url)}
                    className="text-[10px] font-heading text-red-400/80 hover:text-red-400 px-1 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="article-files"
            className="block font-heading text-sm text-paper mb-1"
          >
            Agregar fotos
          </label>
          <input
            id="article-files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            disabled={busy}
            onChange={handleUpload}
            className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-surface file:text-paper file:font-heading file:text-sm hover:file:bg-border disabled:opacity-50"
          />
          <p className="text-muted text-xs mt-1">
            JPG, PNG, WebP, GIF o AVIF. Hasta 15 MB c/u. Subida directa a
            Storage.
          </p>
        </div>
        {uploading && (
          <p className="text-sm text-accent font-heading">Subiendo fotos…</p>
        )}
      </div>
    </div>
  );
}
