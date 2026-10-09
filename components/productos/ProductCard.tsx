import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  number: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
  caseCount: number;
}

export default function ProductCard({
  number,
  name,
  description,
  slug,
  image,
  caseCount,
}: ProductCardProps) {
  return (
    <Link
      href={`/productos/${slug}`}
      className="group flex h-full flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-colors"
    >
      {/* Contenedor panorámico 21:9 */}
      <div className="relative aspect-[21/9] shrink-0 bg-border overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface">
            <span className="font-heading text-muted text-xs tracking-wide">
              Sin imagen
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 min-h-[9.5rem]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-accent text-xs">{number}</span>
          <span className="text-muted text-xs">
            {caseCount} servicio{caseCount === 1 ? "" : "s"}
          </span>
        </div>
        <h3 className="font-heading font-semibold text-paper text-lg leading-snug group-hover:text-accent transition-colors">
          {name}
        </h3>
        <p className="text-muted text-sm mt-1 line-clamp-2 flex-1">{description}</p>
        <span className="font-heading text-xs text-accent mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          VER PRODUCTOS →
        </span>
      </div>
    </Link>
  );
}
