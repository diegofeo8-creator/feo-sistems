import Link from "next/link";
import Image from "next/image";

export interface ArticuloCardProps {
  id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  price?: string | null;
  cover_image?: string | null;
}

export default function ArticuloCard({
  title,
  slug,
  description,
  price,
  cover_image,
}: ArticuloCardProps) {
  return (
    <Link
      href={`/catalogo/${slug}`}
      className="group flex h-full flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/60 transition-colors"
    >
      <div className="relative aspect-square shrink-0 bg-border overflow-hidden">
        {cover_image ? (
          <Image
            src={cover_image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface">
            <span className="font-heading text-muted text-xs tracking-wide">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading font-semibold text-paper text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-muted text-xs mt-1.5 line-clamp-2 flex-1">{description}</p>
        )}
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="font-heading font-bold text-accent text-base">
            {price && String(price).trim() ? price : "Consultar precio"}
          </span>
          <span className="font-heading text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            Ver →
          </span>
        </div>
      </div>
    </Link>
  );
}
