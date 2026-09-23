"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

// El Lightbox solo se descarga cuando hace falta (al hacer clic en
// una foto), no en la carga inicial de la página del caso.
const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

interface GalleryProps {
  images: { url: string; alt: string; caption: string }[];
}

export default function Gallery({ images }: GalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return <p className="text-muted text-sm">Este caso todavía no tiene galería.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setOpenIndex(i)}
            className="relative aspect-[4/3] bg-surface border border-border rounded-sm overflow-hidden hover:border-accent/50 transition-colors"
            aria-label={`Ver imagen ${i + 1}: ${img.alt}`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}
