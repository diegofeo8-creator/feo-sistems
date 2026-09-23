import type { Metadata } from "next";
import { sendContactMessage } from "./actions";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos para consultas, propuestas o para sumar un caso a la biblioteca.",
  alternates: { canonical: "/contacto" },
};

interface Props {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function ContactoPage({ searchParams }: Props) {
  const { error, success } = await searchParams;

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <header className="mb-14 max-w-2xl">
        <p className="font-heading text-accent text-sm font-semibold mb-2">Contacto</p>
        <h1 className="font-heading font-bold text-paper text-4xl md:text-5xl">Escribinos</h1>
        <p className="text-muted mt-4">
          Consultas, presupuestos, servicios, propuestas de colaboración o comentanos tu caso particular, podemos ayudarte!.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-12">
        {/* Info básica de contacto */}
        <div className="space-y-8">
          <div>
            <p className="font-heading text-xs text-muted mb-1">EMAIL</p>
            <a href="mailto:feosystems.ar@gmail.com" className="text-paper hover:text-accent transition-colors">
              feosystems.ar@gmail.com
            </a>
          </div>
          <div>
            <p className="font-heading text-xs text-muted mb-1">TELÉFONO</p>
            <a href="tel:+541100000000" className="text-paper hover:text-accent transition-colors">
              +54 11 6692-4507
            </a>
          </div>
          <div>
            <p className="font-heading text-xs text-muted mb-1">UBICACIÓN</p>
            <p className="text-paper">Almirante Brown, Quilmes, Buenos Aires, Argentina</p>
          </div>
        </div>

        {/* Formulario */}
        <form action={sendContactMessage} className="space-y-5" noValidate>
          {/* Campo trampa para bots: invisible para una persona (fuera de
              pantalla, sin tabIndex, oculto a lectores de pantalla), pero
              presente en el HTML para que un bot que llena "todo" caiga acá. */}
          <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
            <label htmlFor="sitio_web">No completar este campo</label>
            <input type="text" id="sitio_web" name="sitio_web" tabIndex={-1} autoComplete="off" />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400 border border-red-400/30 rounded-sm px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="text-sm text-accent border border-accent/30 rounded-sm px-4 py-3">
              ¡Gracias! Recibimos tu mensaje y te vamos a responder pronto.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="nombre" className="block font-heading text-sm text-paper mb-1">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                required
                maxLength={100}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-heading text-sm text-paper mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={150}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="asunto" className="block font-heading text-sm text-paper mb-1">
              Asunto
            </label>
            <input
              id="asunto"
              name="asunto"
              maxLength={150}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="mensaje" className="block font-heading text-sm text-paper mb-1">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              required
              maxLength={3000}
              rows={6}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-paper focus:outline-none focus:border-accent resize-y"
            />
          </div>

          <p className="text-muted text-xs">
            Al enviar este formulario, tu mensaje se guarda para que podamos responderte.
            No lo compartimos con nadie más.
          </p>

          <button
            type="submit"
            className="font-heading text-sm font-semibold bg-accent text-bg px-6 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            Enviar mensaje
          </button>
        </form>
      </div>
    </div>
  );
}
