import type { Metadata } from "next";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-paper">
      <a href="#admin-main" className="skip-link">
        Saltar al contenido
      </a>
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin" className="font-heading font-bold">
            Feo & Sistems — Admin
          </Link>
          <nav aria-label="Navegación del panel" className="flex items-center gap-6">
            <Link href="/admin" className="font-heading text-sm text-paper/80 hover:text-accent">
              Casos
            </Link>
            <Link
              href="/admin/articulos"
              className="font-heading text-sm text-paper/80 hover:text-accent"
            >
              Artículos
            </Link>
            <Link
              href="/admin/articulos/nuevo"
              className="font-heading text-sm font-semibold bg-accent text-bg px-3 py-1.5 rounded-sm hover:opacity-90"
            >
              + Nuevo artículo
            </Link>
            <Link
              href="/"
              className="font-heading text-sm text-paper/80 hover:text-accent border border-border px-3 py-1.5 rounded-sm hover:border-paper/40 transition-colors"
            >
              Ver sitio público
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main id="admin-main" className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
