// Este cliente se usa en componentes que corren en el navegador
// del visitante (ej: un botón que filtra casos sin recargar la página).
// Usa la clave "anon" (pública), que solo permite lo que las políticas
// de seguridad (RLS) definidas en schema.sql autorizan.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
