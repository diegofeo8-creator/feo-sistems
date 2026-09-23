"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
}

export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Bloquea el scroll del fondo mientras el menú está abierto,
  // y permite cerrar con la tecla Escape (accesibilidad de teclado).
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Mantiene el foco de teclado dentro del panel mientras está abierto,
  // y lo devuelve al botón "Abrir menú" del Header al cerrarlo.
  useFocusTrap(open, containerRef, closeButtonRef);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      id="mobile-menu"
      className="fixed inset-0 z-50 bg-bg flex flex-col md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      <div className="flex items-center justify-between px-6 h-20">
        <span className="font-heading font-bold text-paper">Feo & Sistems</span>
        <button ref={closeButtonRef} aria-label="Cerrar menú" onClick={onClose} className="text-paper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <nav aria-label="Navegación principal" className="flex flex-col gap-1 px-6 mt-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="font-heading text-3xl text-paper py-4 border-b border-border"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
