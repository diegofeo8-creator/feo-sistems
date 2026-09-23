import Link from "next/link";
import CategoryCard from "@/components/servicios/CategoryCard";

interface ProductosSectionProps {
  productos: {
    number: string;
    name: string;
    slug: string;
    description: string;
    caseCount: number;
  }[];
  /** Muestra el enlace "Ver más productos" debajo de la grilla (Home). */
  showMoreLink?: boolean;
}

export default function ProductosSection({
  productos,
  showMoreLink = false,
}: ProductosSectionProps) {
  return (
    // Menos padding inferior para acercar "Los Servicios"
    <section className="max-w-6xl mx-auto px-6 pt-3xl pb-6">
      <div className="flex items-end justify-between mb-10">
        <h2 className="font-heading font-bold text-paper text-3xl">Productos</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productos.map((cat) => (
          <CategoryCard key={cat.slug} {...cat} />
        ))}
      </div>

      {showMoreLink && (
        <div className="mt-8 flex justify-center">
          <Link
            href="/productos"
            className="group inline-flex items-center gap-2 font-heading text-sm font-semibold tracking-wide text-bg bg-accent px-6 py-3 rounded-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Ver más productos
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}
