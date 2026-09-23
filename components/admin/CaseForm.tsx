import type { Category } from "@/types";
import { cloneElement, isValidElement } from "react";
import SubmitButton from "@/components/admin/SubmitButton";

interface CaseFormProps {
  action: (formData: FormData) => void;
  productos: Category[];
  defaultValues?: {
    title?: string;
    subtitle?: string;
    excerpt?: string;
    category_id?: string;
    tipo_servicio_id?: string;
    content?: string;
    technical_description?: string;
    cause?: string;
    consequences?: string;
    solution?: string;
    estimated_cost?: string;
    seo_title?: string;
    seo_description?: string;
    published?: boolean;
    tags?: string;
  };
  submitLabel: string;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<{ name?: string; id?: string }>;
}) {
  // Asocia la etiqueta con su campo automáticamente usando el "name"
  // del input/textarea/select como id. Sin esto, un lector de
  // pantalla no sabe qué campo describe cada etiqueta: solo están
  // cerca visualmente, no conectados en el código.
  const fieldName = isValidElement(children) ? children.props.name : undefined;
  const field =
    isValidElement(children) && fieldName
      ? cloneElement(children, { id: fieldName })
      : children;

  return (
    <div>
      <label htmlFor={fieldName} className="block font-heading text-sm text-paper mb-1">
        {label}
      </label>
      {field}
    </div>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-accent";

export default function CaseForm({ action, productos, categoriasServicios = [], defaultValues = {}, submitLabel }: any) {
  const d = defaultValues;

  return (
    <form action={action} className="space-y-6 max-w-2xl">
      <Field label="Título">
        <input name="title" defaultValue={d.title} required className={inputClass} />
      </Field>

      <Field label="Subtítulo">
        <input name="subtitle" defaultValue={d.subtitle} className={inputClass} />
      </Field>

      <Field label="Descripción corta (excerpt, para tarjetas y SEO)">
        <textarea name="excerpt" defaultValue={d.excerpt} rows={2} className={inputClass} />
      </Field>

      <Field label="Categoría de Hardware">
        <select name="category_id" defaultValue={d.category_id} required className={inputClass}>
          <option value="" disabled>
            Elegir categoría
          </option>
          {productos.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tipo de Servicio Realizado">
        <select name="tipo_servicio_id" defaultValue={d.tipo_servicio_id} required className={inputClass}>
          <option value="" disabled>
            Elegir tipo de servicio
          </option>
          {categoriasServicios.map((serv: any) => (
            <option key={serv.id} value={serv.id}>
              {serv.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="01 — El problema (contenido principal)">
        <textarea name="content" defaultValue={d.content} rows={4} className={inputClass} />
      </Field>

      <Field label="02 — Qué ocurrió (explicación técnica)">
        <textarea name="technical_description" defaultValue={d.technical_description} rows={4} className={inputClass} />
      </Field>

      <Field label="03 — Por qué ocurrió (causa)">
        <textarea name="cause" defaultValue={d.cause} rows={3} className={inputClass} />
      </Field>

      <Field label="04 — Consecuencias">
        <textarea name="consequences" defaultValue={d.consequences} rows={3} className={inputClass} />
      </Field>

      <Field label="05 — Solución">
        <textarea name="solution" defaultValue={d.solution} rows={3} className={inputClass} />
      </Field>

      <Field label="07 — Coste estimado">
        <input name="estimated_cost" defaultValue={d.estimated_cost} className={inputClass} />
      </Field>

      <Field label="Etiquetas (separadas por coma)">
        <input name="tags" defaultValue={d.tags} placeholder="fisuras, cimentación, normativa CTE" className={inputClass} />
      </Field>

      <fieldset className="border border-border rounded-sm p-4">
        <legend className="font-heading text-sm text-accent px-1">SEO</legend>
        <div className="space-y-4">
          <Field label="Título SEO">
            <input name="seo_title" defaultValue={d.seo_title} className={inputClass} />
          </Field>
          <Field label="Descripción SEO">
            <textarea name="seo_description" defaultValue={d.seo_description} rows={2} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <label className="flex items-center gap-2 font-heading text-sm text-paper">
        <input type="checkbox" name="published" defaultChecked={d.published} />
        Publicado (visible para cualquier visitante)
      </label>

      <SubmitButton
        className="font-heading font-semibold bg-accent text-bg px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
        pendingLabel="Guardando cambios…"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
