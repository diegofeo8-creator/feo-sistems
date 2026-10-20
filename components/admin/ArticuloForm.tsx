"use client";

interface Categoria {
  id: string;
  name: string;
}

interface ArticuloFormProps {
  action: (formData: FormData) => void | Promise<void>;
  productos: Categoria[];
  submitLabel: string;
  defaults?: {
    title?: string;
    description?: string | null;
    price?: string | null;
    original_price?: string | null;
    cover_image?: string | null;
    category_id?: string | null;
    published?: boolean;
  };
}

export default function ArticuloForm({
  action,
  productos,
  submitLabel,
  defaults = {},
}: ArticuloFormProps) {
  return (
    <form action={action} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="title" className="block font-heading text-sm text-paper mb-1.5">
          Título *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaults.title ?? ""}
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="category_id" className="block font-heading text-sm text-paper mb-1.5">
          Categoría *
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          defaultValue={defaults.category_id ?? ""}
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-accent"
        >
          <option value="">Elegir categoría…</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="price" className="block font-heading text-sm text-paper mb-1.5">
          Precio
        </label>
        <input
          id="price"
          name="price"
          placeholder="Ej: $ 250.000 o Consultar"
          defaultValue={defaults.price ?? ""}
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-accent"
        />
        <p className="text-muted text-xs mt-1">
          Precio con transferencia / depósito (el de “Mejor precio”).
        </p>
      </div>

      <div>
        <label htmlFor="original_price" className="block font-heading text-sm text-paper mb-1.5">
          Precio otros medios / cuotas
        </label>
        <input
          id="original_price"
          name="original_price"
          placeholder="Ej: 944.444 (opcional)"
          defaultValue={defaults.original_price ?? ""}
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-accent"
        />
        <p className="text-muted text-xs mt-1">
          El de abajo en la ficha (“Ver cuotas”). Si lo dejás vacío, se calcula solo como precio ÷ 0,9.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block font-heading text-sm text-paper mb-1.5">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={defaults.description ?? ""}
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-accent resize-y"
        />
      </div>

      <div>
        <label htmlFor="cover_image" className="block font-heading text-sm text-paper mb-1.5">
          URL de imagen de portada
        </label>
        <input
          id="cover_image"
          name="cover_image"
          type="url"
          placeholder="https://…"
          defaultValue={defaults.cover_image ?? ""}
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-accent"
        />
        <p className="text-muted text-xs mt-1">
          Pegá la URL pública de la imagen (Supabase Storage u otro host).
        </p>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="published"
          defaultChecked={defaults.published ?? false}
          className="rounded border-border"
        />
        <span className="font-heading text-sm text-paper">Publicar en el sitio</span>
      </label>

      <button
        type="submit"
        className="font-heading text-sm font-semibold bg-accent text-bg px-5 py-2.5 rounded-sm hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
