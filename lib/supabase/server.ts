// Este cliente se usa en el servidor (páginas que generan HTML antes
// de enviarlo al visitante, y rutas /api). También usa la clave "anon":
// nunca la "service role key" en código que pueda terminar expuesto.
//
// Nota Next.js 15: cookies() pasó a ser asíncrono, por eso esta
// función ahora es "async" y hay que hacerle await en cada lugar
// donde se usa (const supabase = await createClient()).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se puede ignorar si esto se llama desde un Server Component
            // que no tiene permiso para escribir cookies directamente.
          }
        },
      },
    }
  );
}
