import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Enlace "Saltar al contenido": el primer elemento tabulable de
          la página. Invisible hasta que alguien navega con teclado,
          para no obligarla a pasar por todo el menú (logo, Servicios,
          productos, buscador...) antes de llegar al contenido de cada
          página. Ver .skip-link en globals.css. */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
