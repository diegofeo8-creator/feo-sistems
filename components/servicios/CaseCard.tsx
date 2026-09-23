import Link from "next/link";
import Image from "next/image";

interface CaseCardProps {
  number: string;
  title: string;
  category: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
}

export default function CaseCard({
  number,
  title,
  category,
  excerpt,
  slug,
  coverImage,
}: CaseCardProps) {
  return (
    <Link
      href={`/Servicios/${slug}`}
      draggable={false}
      className="group flex h-full flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-colors"
    >
      {/* Altura fija de imagen: todas las tarjetas miden lo mismo */}
      <div className="relative h-40 shrink-0 bg-border overflow-hidden">
        {coverImage ? (
          <Image draggable={false}
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface">
            <span className="font-heading text-muted text-xs tracking-wide">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Bloque de texto con altura fija: título 2 líneas + excerpt 2 líneas */}
      <div className="flex flex-1 flex-col p-5 min-h-[9.5rem]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-accent text-xs">{number}</span>
          <span className="font-heading text-muted text-xs truncate ml-2">{category}</span>
        </div>
        <h3 className="font-heading font-semibold text-paper text-lg leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-muted text-sm mt-1 line-clamp-2 flex-1">{excerpt}</p>
      </div>
    </Link>
  );
}
