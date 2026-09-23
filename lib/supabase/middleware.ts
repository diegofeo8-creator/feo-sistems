import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Se ejecuta en cada visita a una página del panel admin: revisa si
// hay una sesión válida y la renueva si hace falta. Si no hay sesión,
// redirige a /admin/login.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    // Token de refresh ya consumido (doble request / pestaña vieja):
    // limpiamos cookies de auth y tratamos como sesión inválida.
    if (error) {
      const msg = error.message || "";
      if (
        msg.includes("Refresh Token") ||
        msg.includes("refresh_token") ||
        error.code === "refresh_token_already_used" ||
        error.code === "refresh_token_not_found"
      ) {
        const all = request.cookies.getAll();
        all.forEach(({ name }) => {
          if (name.startsWith("sb-") || name.includes("supabase")) {
            response.cookies.set(name, "", { maxAge: 0, path: "/" });
          }
        });
        user = null;
      } else {
        user = data.user;
      }
    } else {
      user = data.user;
    }
  } catch {
    user = null;
  }

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}
