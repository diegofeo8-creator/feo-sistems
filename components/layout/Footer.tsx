import Link from "next/link";
import SocialLinks from "./SocialLinks";
import BrandMarquee from "./BrandMarquee";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-6">
      {/* Carrusel de marcas — visible en todas las páginas */}
      <BrandMarquee />

      <div className="max-w-6xl mx-auto px-6 py-xl grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div>
          <div className="font-heading font-bold text-paper mb-2">Feo & Sistems</div>
          <p className="text-muted text-sm max-w-xs">
            Servicio técnico de diagnóstico, mantenimiento y reparación de equipos informáticos.
          </p>
        </div>

        <div>
          <div className="font-heading text-sm text-paper mb-3">Explorar</div>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/Servicios" className="hover:text-accent">
                Servicios
              </Link>
            </li>
            <li>
              <Link href="/productos" className="hover:text-accent">
                Productos
              </Link>
            </li>
            <li>
              <Link href="/sobre-nosotros" className="hover:text-accent">
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-accent">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-heading text-sm text-paper mb-3">Legal</div>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/legal/privacidad" className="hover:text-accent">
                Privacidad
              </Link>
            </li>
            <li>
              <Link href="/legal/cookies" className="hover:text-accent">
                Cookies
              </Link>
            </li>
            <li>
              <Link href="/legal/aviso-legal" className="hover:text-accent">
                Aviso legal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-heading text-sm text-paper mb-3">Redes</div>
          <SocialLinks variant="list" />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-muted">
          © {new Date().getFullYear()} Feo & Sistems. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
