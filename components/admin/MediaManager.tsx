"use client";

import { useCallback, useEffect, useState } from "react";
import { uploadMedia, deleteMedia, setCoverImage, addExternalVideo } from "@/app/admin/(protected)/casos/actions";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import type { Media } from "@/types";

interface MediaManagerProps {
  caseId: string;
  media: Media[];
  currentCoverImage?: string | null;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function videoLabel(url: string) {
  if (url.startsWith("vimeo:")) return `Vimeo · ${url.replace("vimeo:", "")}`;
  if (url.includes("youtube") || /^[a-zA-Z0-9_-]{11}$/.test(url)) return `YouTube · ${url}`;
  return url;
}

export default function MediaManager({ caseId, media, currentCoverImage }: MediaManagerProps) {
  const uploadAction = uploadMedia.bind(null, caseId);
  const externalVideoAction = addExternalVideo.bind(null, caseId);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const [pendingPreviews, setPendingPreviews] = useState<{ name: string; url: string; type: string }[]>([]);

  const openPreview = useCallback((url: string, isVideo = false) => {
    setPreviewUrl(url);
    setPreviewIsVideo(isVideo);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewUrl(null);
    setPreviewIsVideo(false);
  }, []);

  // Cerrar modal con Escape
  useEffect(() => {
    if (!previewUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewUrl, closePreview]);

  // Liberar object URLs al desmontar o cambiar selección
  useEffect(() => {
    return () => {
      pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [pendingPreviews]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    const files = Array.from(e.target.files ?? []);
    setPendingPreviews(
      files.map((f) => ({
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type,
      }))
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-muted text-sm">
        La <strong className="text-paper">imagen principal</strong> es la que se muestra en la
        cabecera del caso y en las tarjetas. Subí una o más imágenes y después pulsá{" "}
        <strong className="text-paper">«Usar como principal»</strong> en la que quieras. Si no
        elegís ninguna, se usa automáticamente la primera imagen subida. Hacé clic en la miniatura
        para verla en grande.
      </p>

      {media.length > 0 && (
        <ul className="space-y-3">
          {media.map((m) => {
            const isCover = currentCoverImage === m.url;
            const isImage = m.type === "image";
            const isHostedVideo = m.type === "video" && isDirectVideoUrl(m.url);

            return (
              <li
                key={m.id}
                className={`flex items-stretch gap-4 border rounded-sm p-3 ${
                  isCover ? "border-accent bg-accent/5" : "border-border"
                }`}
              >
                {/* Miniatura / preview */}
                <button
                  type="button"
                  onClick={() => openPreview(m.url, m.type === "video")}
                  className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-sm overflow-hidden bg-surface border border-border group focus:outline-none focus:ring-2 focus:ring-accent"
                  title="Ver en grande"
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.url}
                      alt={m.alt || "Vista previa"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : isHostedVideo ? (
                    <video
                      src={m.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-surface text-muted">
                      <span className="font-heading text-2xl">▶</span>
                      <span className="text-[10px] uppercase tracking-wide">Vídeo</span>
                    </div>
                  )}
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-heading font-semibold bg-black/60 px-2 py-1 rounded-sm">
                      Ampliar
                    </span>
                  </span>
                </button>

                {/* Info + acciones */}
                <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-accent text-xs">
                        {m.type === "video" ? "VÍDEO" : "IMAGEN"}
                      </span>
                      {isCover && (
                        <span className="font-heading text-xs text-accent border border-accent/40 rounded-sm px-1.5 py-0.5">
                          imagen principal
                        </span>
                      )}
                    </div>
                    <p className="text-paper/80 text-sm mt-1 break-all line-clamp-2">
                      {m.type === "video" ? videoLabel(m.url) : m.alt || m.url}
                    </p>
                    {m.caption && (
                      <p className="text-muted text-xs mt-1 line-clamp-1">{m.caption}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {isImage && !isCover && (
                      <form action={setCoverImage.bind(null, caseId, m.url)}>
                        <button
                          type="submit"
                          className="font-heading text-xs font-semibold text-accent hover:opacity-80 border border-accent/40 rounded-sm px-2.5 py-1.5"
                        >
                          Usar como principal
                        </button>
                      </form>
                    )}
                    <form action={deleteMedia.bind(null, m.id, caseId)}>
                      <ConfirmSubmitButton
                        confirmMessage="¿Eliminar este archivo?"
                        className="text-red-400/80 hover:text-red-400 text-xs"
                      >
                        Eliminar
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Subida de uno o varios archivos */}
      <form action={uploadAction} className="border border-border rounded-sm p-4 space-y-3">
        <p className="font-heading text-sm text-paper" id="upload-heading">
          Subir imagen o vídeo propio
        </p>
        <p className="text-muted text-xs -mt-2">
          Podés seleccionar varios archivos a la vez. El tipo (imagen o vídeo) se detecta solo.
          Máx. 8 MB por imagen / 15 MB por vídeo. Alt y pie se aplican al lote (opcionales).
        </p>
        <div>
          <label htmlFor="media-file" className="sr-only">
            Archivos a subir
          </label>
          <input
            id="media-file"
            type="file"
            name="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime"
            required
            aria-describedby="upload-heading"
            className="text-sm text-paper"
            onChange={onFileChange}
          />
        </div>

        {/* Vista previa local antes de subir */}
        {pendingPreviews.length > 0 && (
          <div>
            <p className="font-heading text-xs text-muted mb-2">
              Vista previa ({pendingPreviews.length} archivo
              {pendingPreviews.length === 1 ? "" : "s"}):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pendingPreviews.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => openPreview(p.url, p.type.startsWith("video/"))}
                  className="relative aspect-square rounded-sm overflow-hidden border border-border bg-surface group focus:outline-none focus:ring-2 focus:ring-accent"
                  title={p.name}
                >
                  {p.type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <video src={p.url} muted playsInline className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-white px-1 py-0.5 truncate">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="media-alt" className="sr-only">
            Texto alternativo
          </label>
          <input
            id="media-alt"
            name="alt"
            placeholder="Texto alternativo para el lote (opcional)"
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-paper"
          />
        </div>
        <div>
          <label htmlFor="media-caption" className="sr-only">
            Pie de foto
          </label>
          <input
            id="media-caption"
            name="caption"
            placeholder="Pie de foto para el lote (opcional)"
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-paper"
          />
        </div>
        <button
          type="submit"
          className="font-heading text-sm font-semibold bg-accent text-bg px-4 py-2 rounded-sm hover:opacity-90"
        >
          Subir archivo(s)
        </button>
      </form>

      {/* Enlace a YouTube / Vimeo */}
      <form action={externalVideoAction} className="border border-border rounded-sm p-4 space-y-3">
        <p className="font-heading text-sm text-paper" id="external-video-heading">
          Enlazar vídeo de YouTube o Vimeo
        </p>
        <p className="text-muted text-xs -mt-2">
          Pegá la URL completa del vídeo. No se sube ningún archivo; se guarda solo el enlace.
        </p>
        <div>
          <label htmlFor="video-url" className="sr-only">
            URL del vídeo
          </label>
          <input
            id="video-url"
            name="video_url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/... o https://vimeo.com/..."
            aria-describedby="external-video-heading"
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-paper"
          />
        </div>
        <div>
          <label htmlFor="video-alt" className="sr-only">
            Texto alternativo del vídeo
          </label>
          <input
            id="video-alt"
            name="alt"
            placeholder="Título o descripción corta del vídeo (opcional)"
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-paper"
          />
        </div>
        <div>
          <label htmlFor="video-caption" className="sr-only">
            Pie de vídeo
          </label>
          <input
            id="video-caption"
            name="caption"
            placeholder="Pie de vídeo (opcional)"
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-paper"
          />
        </div>
        <button
          type="submit"
          className="font-heading text-sm font-semibold bg-accent text-bg px-4 py-2 rounded-sm hover:opacity-90"
        >
          Enlazar vídeo
        </button>
      </form>

      {/* Lightbox de previsualización grande */}
      {previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={closePreview}
        >
          <button
            type="button"
            onClick={closePreview}
            className="absolute top-4 right-4 font-heading text-white/90 hover:text-white text-sm border border-white/30 rounded-sm px-3 py-1.5 bg-black/40"
          >
            Cerrar ✕
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {previewIsVideo && isDirectVideoUrl(previewUrl) ? (
              <video
                src={previewUrl}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-sm"
              />
            ) : previewIsVideo ? (
              <div className="bg-surface border border-border rounded-sm px-8 py-10 text-center text-paper">
                <p className="font-heading text-sm mb-2">Vídeo externo</p>
                <p className="text-muted text-xs break-all max-w-md">{videoLabel(previewUrl)}</p>
                <p className="text-muted text-xs mt-3">
                  Los enlaces de YouTube/Vimeo se reproducen en la web pública, no en el panel.
                </p>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Vista previa ampliada"
                className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
