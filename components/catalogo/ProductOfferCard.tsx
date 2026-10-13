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

type Mode = "transfer" | "cuotas";

export default function ProductOfferCard({
  price,
  originalPrice,
  title,
  mercadolibreUrl,
  facebookUrl,
  discountNote,
}: Props) {
  const [mode, setMode] = useState<Mode>("transfer");

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

  // Precio sin el 10% de descuento (otros medios / cuotas)
  const otherPrice =
    priceNum !== null
      ? Math.round(priceNum / 0.9).toLocaleString("es-AR")
      : null;

  const hasSocial = Boolean(mercadolibreUrl || facebookUrl);

  const defaultDiscount =
    "Incluye 10% de descuento por pago con depósito o transferencia.";

  // Gris más claro y visible al seleccionar
  const selectedBg = "bg-white/[0.08]";
  const idleBg = "bg-transparent hover:bg-white/[0.03]";

  return (
    <div className="mt-5 w-full rounded-xl overflow-hidden border border-border bg-surface box-border">
      {/* ===== BLOQUE PRECIO PRINCIPAL (transferencia / 1 pago) ===== */}
      <button
        type="button"
        onClick={() => setMode("transfer")}
        className={`w-full text-left px-4 pt-4 pb-3 transition-colors duration-200 ${
          mode === "transfer" ? selectedBg : idleBg
        }`}
      >
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
          <span
            className={`shrink-0 transition-colors ${
              mode === "transfer" ? "text-accent" : "text-red-500"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={`transition-transform duration-200 ${
                mode === "transfer" ? "rotate-90" : ""
              }`}
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </span>
          <p className="font-heading font-bold text-[28px] md:text-[32px] leading-none tracking-tight text-accent">
            {displayPrice ? `$ ${displayPrice}` : "Consultar precio"}
          </p>
        </div>

        {/* Nota de descuento — animada */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            mode === "transfer"
              ? "max-h-16 opacity-100 mt-2"
              : "max-h-0 opacity-0 mt-0"
          }`}
        >
          <p className="text-[12px] text-muted leading-snug">
            {discountNote?.trim() || defaultDiscount}
          </p>
        </div>
      </button>

      {/* ===== OTROS MEDIOS DE PAGO / CUOTAS ===== */}
      <button
        type="button"
        onClick={() => setMode("cuotas")}
        className={`w-full text-left border-t border-border px-4 py-3 transition-colors duration-200 ${
          mode === "cuotas" ? selectedBg : idleBg
        }`}
      >
        <div className="flex items-start gap-2.5">
          <span
            className={`shrink-0 mt-1 transition-colors ${
              mode === "cuotas" ? "text-accent" : "text-red-500"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={`transition-transform duration-200 ${
                mode === "cuotas" ? "rotate-90" : ""
              }`}
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-muted font-medium mb-1.5">
              Otros medios de pago
            </p>

            {/* Precio en cuotas — siempre visible en este bloque */}
            {otherPrice && (
              <p className="font-heading font-bold text-[22px] md:text-[26px] text-paper leading-none tracking-tight">
                $ {otherPrice}{" "}
                <span className="text-red-400 font-medium text-[14px] align-middle">
                  Ver cuotas
                </span>
              </p>
            )}

            {/* Info extra cuotas — animada */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                mode === "cuotas"
                  ? "max-h-28 opacity-100 mt-2"
                  : "max-h-0 opacity-0 mt-0"
              }`}
            >
              <div className="space-y-1.5">
                <p className="text-[12px] text-muted leading-snug">
                  Abonando con billeteras virtuales o tarjeta de crédito.
                </p>

                <p className="text-[13px] text-paper flex flex-wrap items-center gap-1.5">
                  <span>Cuotas sin interés abonando desde</span>
                  <ModoLogo />
                </p>

                <p className="text-[12px] text-red-400 font-medium">
                  Ver promociones
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* ===== GARANTÍA / STOCK / ENVÍO ===== */}
      <div className="border-t border-border px-4 py-3 space-y-2.5">
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
        <div className="border-t border-border px-4 py-3">
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
        <div className="border-t border-border px-4 py-3">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="11" fill="#00A650" />
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
