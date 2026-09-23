-- =========================================================
-- ESQUEMA DE BASE DE DATOS: Plataforma de Casos Técnicos
-- =========================================================
-- Cómo usar este archivo: en el panel de Supabase, entrá a
-- "SQL Editor" > "New query", pegá todo este contenido y
-- presioná "Run". Esto crea todas las tablas de una sola vez.
-- =========================================================

-- Extensión necesaria para generar IDs únicos (UUID)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- Tabla: productos
-- ---------------------------------------------------------
create table productos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image text
);

-- ---------------------------------------------------------
-- Tabla: servicios (el corazón del proyecto)
-- ---------------------------------------------------------
create table servicios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  subtitle text,
  excerpt text,
  category_id uuid references productos(id) on delete restrict,
  cover_image text,
  content text,                 -- contenido enriquecido del editor visual
  technical_description text,
  cause text,
  consequences text,
  solution text,
  estimated_cost text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  seo_title text,
  seo_description text
);

create index idx_servicios_category on servicios(category_id);
create index idx_servicios_published on servicios(published);

-- ---------------------------------------------------------
-- Tabla: tags
-- ---------------------------------------------------------
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- ---------------------------------------------------------
-- Tabla puente: case_tags (relación muchos-a-muchos)
-- ---------------------------------------------------------
create table case_tags (
  case_id uuid references servicios(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (case_id, tag_id)
);

-- ---------------------------------------------------------
-- Tabla: media (fotos y vídeos de cada caso)
-- ---------------------------------------------------------
create table media (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references servicios(id) on delete cascade,
  type text not null check (type in ('image', 'video')),
  url text not null,
  alt text,
  caption text,
  "order" integer not null default 0
);

create index idx_media_case on media(case_id);

-- ---------------------------------------------------------
-- Tabla: regulations (normativa técnica citada por caso)
-- ---------------------------------------------------------
create table regulations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references servicios(id) on delete cascade,
  name text not null,
  description text,
  url text
);

create index idx_regulations_case on regulations(case_id);

-- ---------------------------------------------------------
-- updated_at automático en cada modificación de un caso
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_servicios_updated_at
before update on servicios
for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- Seguridad: Row Level Security (RLS)
-- ---------------------------------------------------------
-- Regla general: cualquier visitante puede LEER casos publicados.
-- Solo un usuario autenticado (vos, desde /admin) puede
-- crear, editar o borrar. Esto es lo que evita que cualquiera
-- pueda modificar el contenido desde fuera del panel.

alter table servicios enable row level security;
alter table productos enable row level security;
alter table tags enable row level security;
alter table case_tags enable row level security;
alter table media enable row level security;
alter table regulations enable row level security;

-- Lectura pública de casos publicados
create policy "Lectura publica de casos publicados"
on servicios for select
using (published = true);

-- Lectura pública de productos y etiquetas: son solo metadatos de
-- organización (nombres de categoría, nombres de etiqueta), no
-- contenido de un caso puntual, así que no hace falta restringirlas.
create policy "Lectura publica productos" on productos for select using (true);
create policy "Lectura publica tags" on tags for select using (true);

-- Media, normativa y la relación caso-etiqueta SÍ pertenecen a un
-- caso puntual. Si ese caso todavía es un borrador (published =
-- false), sus fotos, vídeos y normativa tampoco deberían poder
-- consultarse desde fuera del panel: alguien podría, si no,
-- consultar directamente la API de Supabase (la URL y la clave
-- "anon" son públicas, viajan en el navegador) y ver el contenido de
-- un caso que el admin todavía no decidió publicar.
create policy "Lectura publica media de casos publicados"
on media for select
using (exists (select 1 from servicios c where c.id = media.case_id and c.published = true));

create policy "Lectura publica regulations de casos publicados"
on regulations for select
using (exists (select 1 from servicios c where c.id = regulations.case_id and c.published = true));

create policy "Lectura publica case_tags de casos publicados"
on case_tags for select
using (exists (select 1 from servicios c where c.id = case_tags.case_id and c.published = true));

-- Escritura solo para usuarios autenticados (el admin)
create policy "Admin gestiona casos" on servicios for all
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admin gestiona productos" on productos for all
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admin gestiona tags" on tags for all
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admin gestiona case_tags" on case_tags for all
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admin gestiona media" on media for all
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admin gestiona regulations" on regulations for all
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Seguridad: bucket de Storage "case-media" (fotos y vídeos)
-- ---------------------------------------------------------
-- El bucket en sí se crea a mano desde el panel de Supabase
-- (Storage > New bucket > nombre "case-media", marcado como
-- "Public bucket" para que las fotos se puedan mostrar en la web sin
-- pedir login). Estas políticas son el equivalente, para archivos,
-- de las políticas de RLS de arriba: cualquiera puede DESCARGAR un
-- archivo (para que se vea la foto), pero solo un usuario logueado
-- puede SUBIR o BORRAR uno. Sin esto, cualquier visitante que
-- descubra la URL del bucket podría subir sus propios archivos.
create policy "Lectura publica de archivos de casos"
on storage.objects for select
using (bucket_id = 'case-media');

create policy "Solo admin sube archivos de casos"
on storage.objects for insert
with check (bucket_id = 'case-media' and auth.role() = 'authenticated');

create policy "Solo admin borra archivos de casos"
on storage.objects for delete
using (bucket_id = 'case-media' and auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Tabla: mensajes_contacto
-- ---------------------------------------------------------
-- Guarda lo que la gente manda desde el formulario de /contacto.
-- Por ahora no se envía ningún email automático: los mensajes quedan
-- acá y se leen desde el "Table Editor" del panel de Supabase (Tabla
-- mensajes_contacto). Si más adelante se agrega una casilla de
-- correo, el enganche natural es un "Database Webhook" de Supabase
-- que dispare un email (por ejemplo con Resend) cada vez que se
-- inserta una fila nueva acá — no hace falta cambiar el formulario
-- ni la Server Action para eso.
create table mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  asunto text,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table mensajes_contacto enable row level security;

-- Cualquier visitante (incluso sin login) puede CREAR un mensaje —
-- si no, el formulario público no podría funcionar. Pero nadie sin
-- sesión puede LEER, EDITAR ni BORRAR mensajes ajenos: no hay
-- política de "select"/"update"/"delete" para el público, así que
-- quedan bloqueados por defecto.
create policy "Cualquiera puede enviar un mensaje de contacto"
on mensajes_contacto for insert
with check (true);

create policy "Solo admin lee mensajes de contacto"
on mensajes_contacto for select
using (auth.role() = 'authenticated');

create policy "Solo admin actualiza mensajes de contacto"
on mensajes_contacto for update
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Solo admin borra mensajes de contacto"
on mensajes_contacto for delete
using (auth.role() = 'authenticated');
