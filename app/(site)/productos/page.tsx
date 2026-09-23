import type { Metadata } from "next";
import ProductCard from "@/components/productos/ProductCard";
import { getAllProductos } from "@/lib/queries";

export const revalidate = 60; // segundos

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo completo de productos y servicios.",
  alternates: { canonical: "/productos" },
};

export default async function ProductosPage() {
  const productos = await getAllProductos();

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <header className="mb-10">
        <p className="font-heading text-accent text-sm font-semibold mb-2">Productos</p>
        <h1 className="font-heading font-bold text-paper text-4xl md:text-5xl max-w-2xl">
          Catálogo completo
        </h1>
        <p className="text-muted mt-4 max-w-xl">
          {productos.length} producto{productos.length === 1 ? "" : ""}
          {productos.length === 1 ? "" : "s"}, y servicios tecnológicos asociados.
        </p>
      </header>

      {productos.length === 0 ? (
        <p className="font-heading text-paper/80 border border-border rounded-sm px-6 py-10 text-center">
          TODAVÍA NO HAY PRODUCTOS CARGADOS.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {productos.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
