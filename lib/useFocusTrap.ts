"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Atrapa el foco de teclado dentro de un diálogo mientras está abierto,
 * y devuelve el foco al elemento que lo abrió cuando se cierra.
 *
 * Por qué hace falta: alguien que navega con teclado o con lector de
 * pantalla y abre el menú móvil o el lightbox NO debe poder seguir
 * tabulando "detrás" del diálogo hacia el resto de la página — eso es
 * confuso y le hace perder de vista dónde está. Al cerrar, el foco
 * vuelve exactamente al botón que abrió el diálogo, en vez de saltar
 * al principio del documento.
 */
export function useFocusTrap(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  initialFocusRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = containerRef.current;

    // Mueve el foco dentro del diálogo apenas se abre.
    const toFocus =
      initialFocusRef?.current ?? container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    toFocus?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Al cerrar, el foco vuelve a donde estaba (el botón que abrió el diálogo).
      previouslyFocused?.focus();
    };
  }, [open, containerRef, initialFocusRef]);
}
