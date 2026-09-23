import Link from "next/link";

interface CaseNavProps {
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}

export default function CaseNav({ prev, next }: CaseNavProps) {
  return (
    <nav aria-label="Navegación entre casos" className="flex items-stretch justify-between gap-4 border-t border-b border-border mt-3xl">
      {prev ? (
        <Link
          href={`/Servicios/${prev.slug}`}
          className="flex-1 py-6 group"
        >
          <div className="font-heading text-xs text-muted mb-1">
            <span aria-hidden="true">← </span>CASO ANTERIOR
          </div>
          <div className="font-heading text-paper group-hover:text-accent transition-colors line-clamp-1">
            {prev.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next && (
        <Link
          href={`/Servicios/${next.slug}`}
          className="flex-1 py-6 text-right group border-l border-border pl-4"
        >
          <div className="font-heading text-xs text-muted mb-1">
            CASO SIGUIENTE<span aria-hidden="true"> →</span>
          </div>
          <div className="font-heading text-paper group-hover:text-accent transition-colors line-clamp-1">
            {next.title}
          </div>
        </Link>
      )}
    </nav>
  );
}
