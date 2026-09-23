// Estos tipos son el reflejo, en código, de las tablas que vamos a crear
// en la base de datos (ver /supabase/schema.sql). Cada vez que agreguemos
// un campo a una tabla, lo reflejamos también acá.

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export type MediaType = "image" | "video";

export interface Media {
  id: string;
  case_id: string;
  type: MediaType;
  url: string;
  alt: string | null;
  caption: string | null;
  order: number;
}

export interface Regulation {
  id: string;
  case_id: string;
  name: string;
  description: string | null;
  url: string | null;
}

export interface Case {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  category_id: string;
  cover_image: string | null;
  content: string;
  technical_description: string | null;
  cause: string | null;
  consequences: string | null;
  solution: string | null;
  estimated_cost: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;

  // Relaciones (se cargan por separado con joins)
  category?: Category;
  tags?: Tag[];
  media?: Media[];
  regulations?: Regulation[];
}
