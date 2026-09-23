import { notFound } from "next/navigation";
import CaseForm from "@/components/admin/CaseForm";
import MediaManager from "@/components/admin/MediaManager";
import RegulationsManager from "@/components/admin/RegulationsManager";
import { getproductos, getCaseByIdForAdmin } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { updateCase } from "../../actions";

export const dynamic = "force-dynamic"; // 👈 ¡TRUCO AGREGADO AQUÍ PARA ROMPER LA CACHÉ!

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function EditarCasoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, success } = await searchParams;
  const supabase = await createClient();

  const [productos, caseData, { data: categoriasServicios }] = await Promise.all([
    getproductos(),
    getCaseByIdForAdmin(id),
    supabase.from("categorias_servicios").select("id, name, slug"),
  ]);

  if (!caseData) notFound();

  const tags = (caseData.case_tags ?? [])
    // @ts-expect-error -- la relación viene anidada en tiempo de ejecución
    .map((ct) => ct.tags?.name)
    .filter(Boolean)
    .join(", ");

  const boundUpdate = updateCase.bind(null, caseData.id);

  return (
    <div className="space-y-12">
      {error && (
        <p className="bg-red-950/40 border border-red-400/40 text-red-300 text-sm rounded-sm px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="bg-accent/10 border border-accent/40 text-accent text-sm rounded-sm px-4 py-3">
          {success}
        </p>
      )}

      <div>
        <h1 className="font-heading font-bold text-2xl mb-8">Editar caso</h1>
        <CaseForm
          action={boundUpdate}
          productos={productos}
          categoriasServicios={categoriasServicios ?? []}
          submitLabel="Guardar cambios"
          defaultValues={{ ...caseData, tags }}
        />
      </div>

      <div className="max-w-2xl border-t border-border pt-8">
        <h2 className="font-heading font-bold text-xl mb-4">Galería y vídeo</h2>
        <MediaManager caseId={caseData.id} media={caseData.media ?? []} currentCoverImage={caseData.cover_image} />
      </div>

      <div className="max-w-2xl border-t border-border pt-8">
        <h2 className="font-heading font-bold text-xl mb-4">Normativa</h2>
        <RegulationsManager caseId={caseData.id} regulations={caseData.regulations ?? []} />
      </div>
    </div>
  );
}
