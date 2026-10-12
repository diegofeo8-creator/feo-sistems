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
    originalNum !== null && priceNum !== null && originalNum > priceNum;

  const savings =
    hasDiscount && originalNum !== null && priceNum !== null
      ? (originalNum - priceNum).toLocaleString("es-AR")
      : null;

  // Precio sin el 10% de descuento (otros medios)
  const otherPrice =
    priceNum !== null
      ? Math.round(priceNum / 0.9).toLocaleString("es-AR")
      : null;

  const hasSocial = Boolean(mercadolibreUrl || facebookUrl);

  const defaultDiscount =
    "Incluye 10% de descuento por pago con depósito o transferencia.";

  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-border bg-surface">
      {/* ===== BLOQUE PRECIO PRINCIPAL ===== */}
      <div className="px-4 pt-4 pb-3">
        {/* Mejor precio + tachado + ahorro */}
        {hasDiscount ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
            <span className="text-[11px] text-muted font-medium">Mejor precio</span>
            <span className="text-[13px] text-muted/70 line-through">
              $ {displayOriginal}
            </span>
            {savings && (
              <span className="text-[13px] text-emerald-400 font-medium">
                $ {savings}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-muted font-medium mb-1">Mejor precio</p>
        )}

        {/* Precio grande + chevron */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpenPayments((v) => !v)}
            className="text-red-500 shrink-0"
            aria-label="Ver medios de pago"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={`transition-transform duration-200 ${
                openPayments ? "rotate-90" : ""
              }`}
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          <p className="font-heading font-bold text-[28px] md:text-[32px] leading-none tracking-tight text-accent">
            {displayPrice ? `$ ${displayPrice}` : "Consultar precio"}
          </p>
        </div>

        {/* Nota de descuento */}
        <p className="text-[12px] text-muted mt-2 leading-snug">
          {discountNote?.trim() || defaultDiscount}
        </p>
      </div>

      {/* ===== OTROS MEDIOS DE PAGO ===== */}
      <div className="border-t border-border/60">
        <button
          type="button"
          onClick={() => setOpenPayments((v) => !v)}
          className="w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-paper/5 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={`text-red-500 shrink-0 mt-1 transition-transform duration-200 ${
              openPayments ? "rotate-90" : ""
            }`}
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-muted font-medium mb-1">
              Otros medios de pago
            </p>

            {otherPrice && (
              <p className="text-[15px] font-semibold text-paper leading-tight">
                $ {otherPrice}{" "}
                <span className="text-red-400 font-medium text-[13px]">
                  Ver cuotas
                </span>
              </p>
            )}

            <p className="text-[12px] text-muted mt-1 leading-snug">
              Abonando con billeteras virtuales o tarjeta de crédito.
            </p>

            {/* MODO */}
            <p className="text-[13px] text-paper mt-2 flex flex-wrap items-center gap-1.5">
              <span>Cuotas sin interés abonando desde</span>
              <ModoLogo />
            </p>

            <p className="text-[12px] text-red-400 mt-1.5 font-medium">
              Ver promociones
            </p>
          </div>
        </button>

        {openPayments && (
          <div className="px-4 pb-3 pt-0 space-y-2 text-[13px] text-paper/85">
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

      {/* ===== GARANTÍA / STOCK / ENVÍO ===== */}
      <div className="border-t border-border/60 px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-emerald-400 text-base leading-none">✓</span>
          <span className="text-emerald-400 font-medium">Stock disponible</span>
        </div>

        <div className="flex items-start gap-2 text-[13px] text-paper/85">
          <ShieldIcon />
          <span>
            Garantía - 1 mes{" "}
            <a
              href="/legal/aviso-legal"
              className="text-accent hover:underline"
            >
              Ver términos y condiciones
            </a>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[13px] text-paper/85">
          <TruckIcon />
          <span>Envíos a todo el país / retiro en Quilmes – Almirante Brown</span>
        </div>
      </div>

      {/* ===== LINKS ML / FB ===== */}
      {hasSocial && (
        <div className="border-t border-border/60 px-4 py-3">
          <p className="text-[11px] text-muted mb-2.5 font-medium uppercase tracking-wide">
            Ver publicación original
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {mercadolibreUrl && (
              <a
                href={mercadolibreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[13px] font-semibold bg-[#FFE600] text-[#333] px-4 py-2.5 rounded-sm hover:brightness-95 transition-all flex-1"
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
                className="inline-flex items-center justify-center gap-2 text-[13px] font-semibold bg-[#1877F2] text-white px-4 py-2.5 rounded-sm hover:brightness-110 transition-all flex-1"
              >
                <FacebookIcon />
                Facebook Marketplace
              </a>
            )}
          </div>
        </div>
      )}

      {!hasSocial && (
        <div className="border-t border-border/60 px-4 py-3">
          <p className="text-[12px] text-muted">
            Publicación disponible solo en esta web. Consultá por WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── MODO logo (verde oficial) ─── */
function ModoLogo() {
  return (
    <span
      className="inline-flex items-center gap-1 font-bold text-[14px] tracking-tight"
      style={{ color: "#00A650" }}
      aria-label="MODO"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        {/* Círculo base */}
        <circle cx="12" cy="12" r="11" fill="#00A650" />
        {/* M estilizada */}
        <path
          d="M6.5 16.5V8.5L9.2 13.2L11.9 8.5V16.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M13.5 16.5V8.5H17.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span>MODO</span>
    </span>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="text-muted shrink-0 mt-0.5"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="text-muted shrink-0"
      aria-hidden
    >
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function MercadoLibreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}
