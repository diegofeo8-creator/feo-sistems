"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";

const NAV_LINKS = [
  { href: "/Servicios", label: "Servicios" },
  { href: "/productos", label: "Productos" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-bg/90 backdrop-blur border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-heading font-bold text-paper text-3xl tracking-tight">
          Feo & Sistems
        </Link>

        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-sm text-paper/80 hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <SearchBar />
          <Link
            href="/Servicios"
            className="font-heading text-sm font-semibold bg-accent text-bg px-4 py-2 rounded-sm hover:opacity-90 transition-opacity"
          >
            Explorar casos
          </Link>
        </nav>

        <button
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="md:hidden text-paper"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
    </header>
  );
}
