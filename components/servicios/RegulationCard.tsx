interface RegulationCardProps {
  code: string;
  description: string;
}

export default function RegulationCard({ code, description }: RegulationCardProps) {
  return (
    <div className="flex items-center gap-4 border border-technical/50 bg-technical/10 rounded-sm px-5 py-4">
      <span className="font-heading font-semibold text-technical text-sm shrink-0">{code}</span>
      <span className="text-muted text-sm">{description}</span>
    </div>
  );
}
