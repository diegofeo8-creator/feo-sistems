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

function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).replace(/[^\d]/g, "");
  if (!str) return null;
  const num = Number(str);
  return Number.isNaN(num) ? null : num;
}

function formatPrice(value: string | number | null | undefined): string | null {
  const num = parseNumber(value);
  if (num === null) return null;
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
  const [openPayments, setOpenPayments] = useState(true);

  const displayPrice = formatPrice(price);
  const displayOriginal = formatPrice(originalPrice);
  const priceNum = parseNumber(price);
  const originalNum = parseNumber(originalPrice);

  const hasDiscount =
    originalNum !== null &&
    priceNum !== null &&
    originalNum > priceNum;

  const savings =
    hasDiscount && originalNum !== null && priceNum !== null
      ? (originalNum - priceNum).toLocaleString("es-AR")
      : null;

  // Precio sin el 10% de descuento (aprox. para "otros medios")
  const otherPrice =
    priceNum !== null
      ? Math.round(priceNum / 0.9).toLocaleString("es-AR")
      : null;

  const hasSocial = Boolean(mercadolibreUrl || facebookUrl);

  const defaultDiscount =
    "Incluye 10% de descuento por pago con depósito o transferencia.";

  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-[#e0e0e0] bg-[#f5f5f5] text-[#333] shadow-sm">
      {/* ===== BLOQUE PRECIO PRINCIPAL ===== */}
      <div className="px-4 pt-4 pb-3 bg-[#f5f5f5]">
        {/* Mejor precio + tachado + ahorro */}
        {hasDiscount && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
            <span className="text-[11px] text-[#666] font-medium">
              Mejor precio
            </span>
            <span className="text-[13px] text-[#999] line-through">
              $ {displayOriginal}
            </span>
            {savings && (
              <span className="text-[13px] text-[#00a650] font-medium">
                $ {savings}
              </span>
            )}
          </div>
        )}

        {/* Precio grande verde + chevron */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpenPayments((v) => !v)}
            className="text-[#f23d4f] shrink-0"
            aria-label="Ver más"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={`transition-transform duration-200 ${
                openPayments ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <p className="font-bold text-[28px] md:text-[32px] leading-none tracking-tight text-[#00a650]">
            {displayPrice ? `$ ${displayPrice}` : "Consultar precio"}
          </p>
        </div>

        {/* Nota de descuento */}
        <p className="text-[12px] text-[#666] mt-2 leading-snug">
          {discountNote?.trim() || defaultDiscount}
        </p>
      </div>

      {/* ===== OTROS MEDIOS DE PAGO ===== */}
      <div className="border-t border-[#e0e0e0] bg-[#f0f0f0]">
        <button
          type="button"
          onClick={() => setOpenPayments((v) => !v)}
          className="w-full flex items-start gap-2 px-4 py-3 text-left hover:bg-[#e8e8e8] transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={`text-[#f23d4f] shrink-0 mt-1 transition-transform duration-200 ${
              openPayments ? "rotate-90" : ""
            }`}
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-[#666] font-medium mb-0.5">
              Otros medios de pago
            </p>
            {otherPrice && (
              <p className="text-[15px] font-semibold text-[#333] leading-tight">
                $ {otherPrice}{" "}
                <span className="text-[#f23d4f] font-medium text-[13px]">
                  Ver cuotas
                </span>
              </p>
            )}
            <p className="text-[12px] text-[#666] mt-0.5">
              Cuotas sin interés abonando desde{" "}
              <span className="text-[#00a650] font-semibold">MODO</span>
            </p>
            <p className="text-[12px] text-[#f23d4f] mt-1 font-medium">
              Ver promociones
            </p>
          </div>
        </button>

        {openPayments && (
          <div className="px-4 pb-3 pt-0 space-y-2 text-[13px] text-[#444]">
            <div className="flex items-start gap-2">
              <span className="text-[#00a650] mt-0.5">•</span>
              <span>
                <strong className="text-[#333]">Transferencia / Depósito</strong>
                <span className="text-[#666]"> — 10% de descuento</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#00a650] mt-0.5">•</span>
              <span>
                <strong className="text-[#333]">Efectivo</strong>
                <span className="text-[#666]"> — al retirar o coordinar</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#00a650] mt-0.5">•</span>
              <span>
                <strong className="text-[#333]">Tarjeta / Cuotas</strong>
                <span className="text-[#666]"> — consultar disponibilidad</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#00a650] mt-0.5">•</span>
              <span>
                <strong className="text-[#333]">MODO / Mercado Pago</strong>
                <span className="text-[#666]"> — según el medio</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ===== LINKS ML / FB ===== */}
      {hasSocial && (
        <div className="border-t border-[#e0e0e0] bg-white px-4 py-3">
          <p className="text-[11px] text-[#888] mb-2 font-medium uppercase tracking-wide">
            Ver publicación original
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {mercadolibreUrl && (
              <a
                href={mercadolibreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[13px] font-semibold bg-[#FFE600] text-[#333] px-4 py-2.5 rounded hover:brightness-95 transition-all flex-1"
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
                className="inline-flex items-center justify-center gap-2 text-[13px] font-semibold bg-[#1877F2] text-white px-4 py-2.5 rounded hover:brightness-110 transition-all flex-1"
              >
                <FacebookIcon />
                Facebook Marketplace
              </a>
            )}
          </div>
        </div>
      )}

      {/* Sin links */}
      {!hasSocial && (
        <div className="border-t border-[#e0e0e0] bg-white px-4 py-3">
          <p className="text-[12px] text-[#888]">
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
      width="16"
      height="16"
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}
