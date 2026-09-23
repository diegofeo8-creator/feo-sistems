import type { Metadata } from "next";
import LibraryBrowser from "@/components/servicios/LibraryBrowser";
import { getLibraryData } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server"; // 👈 Importamos el cliente de Supabase

export const revalidate = 60; // segundos
export const dynamic = "force-dynamic"; // 👈 Forzamos a que lea la BD en vivo siempre para evitar caché vieja

export const metadata: Metadata = {
  title: "Servicios",
  description: "Todos los casos técnicos documentados, filtrables por categoría, año y etiqueta.",
  alternates: { canonical: "/Servicios" },
};

export default async function ServiciosPage() {
  const supabase = await createClient();

  // 1. Traemos la información original de los casos y las categorías en paralelo directo de Supabase
  const [ { servicios }, { data: dbCategorias } ] = await Promise.all([
    getLibraryData(),
    supabase.from("categorias_servicios").select("id, name, slug") // 👈 Lee tu tabla real en vivo
  ]);

  const listaCategoriasReal = dbCategorias ?? [];

  // 2. Convertimos los IDs a strings para que coincidan con la estructura que el buscador frontend espera
  const categoriasAutomatizadas = listaCategoriasReal.map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    slug: cat.slug
  }));

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <header className="mb-10">
        <p className="font-heading text-accent text-sm font-semibold mb-2">Servicios</p>
        <h1 className="font-heading font-bold text-paper text-4xl md:text-5xl max-w-2xl">
          Servicios realizados
        </h1>
        <p className="text-muted mt-4 max-w-xl">
          {servicios.length} servicios documentados con foto, vídeo y descripción técnica.
        </p>
      </header>

      {/* 3. Le inyectamos la lista 100% automática al componente visual */}
      <LibraryBrowser servicios={servicios} productos={categoriasAutomatizadas} />
    </div>
  );
}
