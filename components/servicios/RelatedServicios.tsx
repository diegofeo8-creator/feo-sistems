import CaseCard from "./CaseCard";

interface RelatedserviciosProps {
  servicios: {
    number: string;
    title: string;
    category: string;
    excerpt: string;
    slug: string;
    coverImage?: string;
  }[];
}

export default function Relatedservicios({ servicios }: RelatedserviciosProps) {
  if (servicios.length === 0) return null;

  return (
    <section className="mt-3xl">
      <h2 className="font-heading font-bold text-paper text-2xl mb-6">
        También puede interesarte
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicios.map((c) => (
          <CaseCard key={c.slug} {...c} />
        ))}
      </div>
    </section>
  );
}
