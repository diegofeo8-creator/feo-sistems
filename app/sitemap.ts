import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getproductos } from "@/lib/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: servicios }, productos] = await Promise.all([
    supabase
      .from("servicios")
      .select("slug, updated_at")
      .eq("published", true),
    getproductos(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/Servicios`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/productos`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = productos.map((cat) => ({
    url: `${SITE_URL}/productos/${cat.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const caseRoutes: MetadataRoute.Sitemap = (servicios ?? []).map((c) => ({
    url: `${SITE_URL}/Servicios/${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...caseRoutes];
}
