"use client";

import { useState } from "react";
import Image from "next/image";

interface VideoPlayerProps {
  videoId: string | null;
  title: string;
}

function parseVideoRef(raw: string | null): { provider: "youtube" | "vimeo"; id: string } | null {
  if (!raw) return null;
  if (raw.startsWith("vimeo:")) {
    return { provider: "vimeo", id: raw.replace("vimeo:", "") };
  }
  // Asumimos YouTube (ID de 11 caracteres o el valor guardado)
  return { provider: "youtube", id: raw };
}

export default function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const parsed = parseVideoRef(videoId);

  if (!parsed) {
    return (
      <div className="aspect-[9/16] max-w-[340px] mx-auto bg-surface border border-border rounded-2xl flex items-center justify-center">
        <span className="text-muted text-sm">Este caso todavía no tiene vídeo.</span>
      </div>
    );
  }

  if (playing) {
    const src =
      parsed.provider === "youtube"
        ? `https://www.youtube-nocookie.com/embed/${parsed.id}?autoplay=1&rel=0`
        : `https://player.vimeo.com/video/${parsed.id}?autoplay=1`;

    return (
      <div className="aspect-[9/16] max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-black">
        <iframe
          className="w-full h-full"
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Thumbnail
  const thumbSrc =
    parsed.provider === "youtube"
      ? `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`
      : null; // Vimeo requiere API; usamos placeholder

  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative aspect-[9/16] max-w-[340px] mx-auto w-full bg-surface border border-border rounded-2xl overflow-hidden group text-left block"
      aria-label={`Reproducir vídeo: ${title}`}
    >
      {thumbSrc ? (
        <Image
          src={thumbSrc}
          alt=""
          fill
          sizes="340px"
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#15181B" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <span className="absolute bottom-3 left-3 font-heading text-xs text-paper/90 bg-bg/70 px-2 py-1 rounded-sm">
        {parsed.provider === "youtube" ? "YouTube" : "Vimeo"}
      </span>
    </button>
  );
}
