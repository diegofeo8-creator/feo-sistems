import Link from "next/link";

interface CategoryCardProps {
  number: string;
  name: string;
  description: string;
  caseCount: number;
  slug: string;
  /** Activa el borde iluminado (solo se usa en la Home). */
  glow?: boolean;
}

export default function CategoryCard({
  number,
  name,
  description,
  caseCount,
  slug,
  glow = false,
}: CategoryCardProps) {
  return (
    <Link
      href={`/productos/${slug}`}
      className={`group block bg-surface border border-border rounded-xl p-6 transition-colors ${
        glow
          ? "card-glow"
          : "hover:border-accent/60"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-heading text-accent text-sm">{number}</span>
        <span className="text-muted text-xs">{caseCount} casos</span>
      </div>
      <h3 className="font-heading font-semibold text-paper text-xl group-hover:text-accent transition-colors">
        {name}
      </h3>
      <p className="text-muted text-sm mt-2">{description}</p>
    </Link>
  );
}
