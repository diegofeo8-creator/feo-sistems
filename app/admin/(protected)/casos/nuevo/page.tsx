import CaseForm from "@/components/admin/CaseForm";
import { getproductos } from "@/lib/queries";
import { createCase } from "../actions";

export default async function NuevoCasoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const productos = await getproductos();

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl mb-8">Nuevo caso</h1>
      {error && (
        <p className="text-red-400 text-sm mb-4">Error al guardar: {error}</p>
      )}
      <CaseForm action={createCase} productos={productos} submitLabel="Crear caso" />
      <p className="text-muted text-sm mt-6">
        Después de crear el caso vas a poder subir fotos, vídeo y normativa desde su página de edición.
      </p>
    </div>
  );
}
