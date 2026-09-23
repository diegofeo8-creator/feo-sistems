import StatCounter from "@/components/servicios/StatCounter";

// Los números son configurables: se conectan a datos reales o
// editables desde /admin en una fase posterior.
const STATS = [
  { target: 120, suffix: "+", label: "Casos documentados" },
  { target: 600, suffix: "+", label: "Fotografías" },
  { target: 10, suffix: "", label: "productos y servicios" },
  { target: 80, suffix: "+", label: "Horas de documentación" },
];

export default function StatsSection() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat) => (
          <StatCounter key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
