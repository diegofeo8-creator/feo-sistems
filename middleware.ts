import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Solo se ejecuta sobre /admin y sus subrutas — el resto del sitio
  // (Home, Servicios, casos) no pasa por esta verificación.
  matcher: ["/admin/:path*"],
};
