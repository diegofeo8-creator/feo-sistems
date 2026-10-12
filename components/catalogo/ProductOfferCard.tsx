"use client";

import { useState } from "react";

interface Props {
  price: string | number | null;
  originalPrice?: string | number | null;
  title: string;
  mercadolibreUrl?: string | null;
  facebookUrl?: string | null;
  /** Texto opcional del descuento. Por defecto el de 10% por transferencia. */
  discountNote?: string | null;
}

function formatPrice(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).replace(/[^\d]/g, "");
  if (!str) return null;
  const num = Number(str);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("es-AR");
}

export default function ProductOfferCard({
  price,
  originalPrice,
  title,
  mercadolibreUrl,
  facebookUrl,
  discountNote,
}: Props) {
  const [openPayments, setOpenPayments] = useState(false);

  const displayPrice = formatPrice(price);
  const displayOriginal = formatPrice(originalPrice);
  const hasDiscount =
    Boolean(displayOriginal && displayPrice && displayOriginal !== displayPrice);

  const hasSocial = Boolean(mercadolibreUrl || facebookUrl);

  const defaultDiscount =
    "Incluye 10% de descuento por pago con depósito o transferencia.";

  return (
    <div className="mt-5 rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
      {/* Bloque precio – estilo similar al de MercadoLibre */}
      <div className="px-4 pt-4 pb-3">
        {hasDiscount && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-muted text-sm line-through">
              $ {displayOriginal}
            </span>
          </div>
        )}

        <p className="font-heading font-bold text-accent text-2xl md:text-3xl leading-none tracking-tight">
          {displayPrice ? `$ ${displayPrice}` : "Consultar precio"}
        </p>

        <p className="text-muted text-xs mt-2 leading-snug">
          {discountNote?.trim() || defaultDiscount}
        </p>
      </div>

      {/* Otros medios de pago (acordeón) */}
      <div className="border-t border-border/60">
        <button
          type="button"
          onClick={() => setOpenPayments((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-paper/5 transition-colors"
        >
          <span className="font-heading text-sm text-paper font-medium">
            Otros medios de pago
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className={`text-muted shrink-0 transition-transform duration-200 ${
              openPayments ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {openPayments && (
          <div className="px-4 pb-3 space-y-2.5 text-sm text-paper/85">
            <div className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>
                <strong className="text-paper">Transferencia / Depósito</strong>
                <span className="text-muted"> — 10% de descuento</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>
                <strong className="text-paper">Efectivo</strong>
                <span className="text-muted"> — al retirar o coordinar</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>
                <strong className="text-paper">Tarjeta / Cuotas</strong>
                <span className="text-muted"> — consultar disponibilidad</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>
                <strong className="text-paper">MODO / Mercado Pago</strong>
                <span className="text-muted"> — según el medio</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Links a publicaciones originales – siempre visibles si existen */}
      {hasSocial && (
        <div className="border-t border-border/60 px-4 py-3">
          <p className="font-heading text-xs text-muted mb-2.5">
            Ver publicación original
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {mercadolibreUrl && (
              <a
                href={mercadolibreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-heading text-sm font-semibold bg-[#FFE600] text-[#333] px-4 py-2.5 rounded-sm hover:brightness-95 transition-all flex-1"
              >
                <MercadoLibreIcon />
                MercadoLibre
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-heading text-sm font-semibold bg-[#1877F2] text-white px-4 py-2.5 rounded-sm hover:brightness-110 transition-all flex-1"
              >
                <FacebookIcon />
                Facebook Marketplace
              </a>
            )}
          </div>
        </div>
      )}

      {/* Sin links de redes */}
      {!hasSocial && (
        <div className="border-t border-border/60 px-4 py-3">
          <p className="text-muted text-xs">
            Publicación disponible solo en esta web. Consultá por WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}

function MercadoLibreIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}
