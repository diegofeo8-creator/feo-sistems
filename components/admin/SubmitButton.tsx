"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Texto que se muestra mientras se procesa (por defecto: "Guardando…") */
  pendingLabel?: string;
}

/**
 * Botón de envío con feedback visual.
 * Usa useFormStatus de React 19 para saber cuándo el Server Action
 * está procesando. Muestra:
 *  1. El botón deshabilitado + texto "Guardando…"
 *  2. Una barra de progreso indeterminada fija en la parte superior
 *     de la pantalla (se mantiene hasta que el servidor redirige).
 */
export default function SubmitButton({
  children,
  className = "",
  pendingLabel = "Guardando…",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const [showBar, setShowBar] = useState(false);

  // Cuando pending pasa a true, mostramos la barra.
  // No la ocultamos manualmente: la redirección del servidor
  // desmonta toda la página y la barra desaparece sola.
  useEffect(() => {
    if (pending) setShowBar(true);
  }, [pending]);

  return (
    <>
      {/* Barra de progreso fija en la parte superior */}
      {showBar && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] h-1 bg-border overflow-hidden"
          role="progressbar"
          aria-valuetext="Procesando cambios…"
          aria-busy="true"
        >
          <div className="h-full bg-accent animate-progress-indeterminate" />
        </div>
      )}

      {/* Overlay semitransparente para reforzar que algo está pasando */}
      {showBar && (
        <div
          className="fixed inset-0 z-[90] bg-bg/40 pointer-events-none"
          aria-hidden="true"
        />
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${className} ${pending ? "opacity-70 cursor-wait" : ""}`}
        aria-busy={pending}
      >
        {pending ? pendingLabel : children}
      </button>
    </>
  );
}
