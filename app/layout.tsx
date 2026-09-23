import type { Metadata } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import "../styles/globals.css";

const heading = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading-family",
});

const body = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body-family",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Feo & Sistems — Servicios de defectos documentados en obra",
    template: "%s — Feo & Sistems",
  },
  description:
    "Servicios editorial de casos técnicos reales: humedad, estructura, cubiertas y fachadas, documentados con foto, vídeo y normativa.",
  openGraph: {
    type: "website",
    siteName: "Feo & Sistems",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Este layout raíz NO incluye el header ni el footer: esos viven en
// app/(site)/layout.tsx, para que el panel /admin tenga su propia
// interfaz separada sin la navegación pública encima.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
