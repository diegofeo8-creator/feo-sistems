import type { Metadata } from "next";
import { login } from "./actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading font-bold text-paper text-2xl mb-1">
          Feo & Sistems
        </h1>
        <p className="text-muted text-sm mb-8">Panel de administración</p>

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-heading text-sm text-paper mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-heading text-sm text-paper mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              Email o contraseña incorrectos. Probá de nuevo.
            </p>
          )}

          <button
            type="submit"
            className="w-full font-heading font-semibold bg-accent text-bg py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
