"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/useFocusTrap";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
}

export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  useFocusTrap(open, containerRef, closeButtonRef);

  if (!open) return null;

  // Portal a body: evita que backdrop-blur del <header> atrape position:fixed
  const panel = (
    <div
      ref={containerRef}
      id="mobile-menu"
      className="fixed inset-0 z-[60] flex flex-col md:hidden bg-bg"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      {/* Barra superior propia (única): logo + cerrar */}
      <div className="flex items-center justify-between px-6 h-20 shrink-0 border-b border-border">
        <span className="font-heading font-bold text-paper text-3xl tracking-tight">
          Feo & Sistems
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="text-paper p-1"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav
        aria-label="Navegación principal"
        className="flex flex-col gap-1 px-6 pt-6 pb-10 overflow-y-auto flex-1"
      >
        {links.map((link, i) => (
          <Link
            key={link.href}
            ref={i === 0 ? firstLinkRef : undefined}
            href={link.href}
            onClick={onClose}
            className="font-heading text-3xl text-paper py-4 border-b border-border hover:text-accent transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}
