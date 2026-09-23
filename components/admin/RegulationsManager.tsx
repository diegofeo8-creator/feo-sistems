import { addRegulation, deleteRegulation } from "@/app/admin/(protected)/casos/actions";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import type { Regulation } from "@/types";

interface RegulationsManagerProps {
  caseId: string;
  regulations: Regulation[];
}

export default function RegulationsManager({ caseId, regulations }: RegulationsManagerProps) {
  const addAction = addRegulation.bind(null, caseId);

  return (
    <div className="space-y-4">
      {regulations.length > 0 && (
        <ul className="space-y-2">
          {regulations.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between border border-technical/40 bg-technical/10 rounded-sm px-3 py-2 text-sm"
            >
              <div>
                <span className="font-heading text-technical text-xs mr-2">{r.name}</span>
                <span className="text-muted">{r.description}</span>
              </div>
              <form action={deleteRegulation.bind(null, r.id, caseId)}>
                <ConfirmSubmitButton
                  confirmMessage="¿Eliminar esta normativa?"
                  className="text-red-400/80 hover:text-red-400 text-xs"
                >
                  Eliminar
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={addAction} className="border border-border rounded-sm p-4 space-y-3">
        <p className="font-heading text-sm text-paper">Agregar normativa</p>
        <input
          name="reg_name"
          placeholder="Código (ej: CTE DB-HS1)"
          required
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm"
        />
        <input
          name="reg_description"
          placeholder="Descripción breve"
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm"
        />
        <input
          name="reg_url"
          placeholder="Enlace a la normativa (opcional)"
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="font-heading text-sm font-semibold bg-accent text-bg px-4 py-2 rounded-sm hover:opacity-90"
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
