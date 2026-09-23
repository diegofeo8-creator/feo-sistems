// Embed del perfil de Google Maps del local (Share → Insertar mapa).
// Place ID: 0x95a32fbc702a46d1:0x2e8f2cdaecef4511
// Short link: https://maps.app.goo.gl/s9hp132Eqh87D8Ke6
const DIRECCION = "Almte. Brown 1423, B1882 Quilmes, Provincia de Buenos Aires, Argentina";
const MAPS_LINK = "https://maps.app.goo.gl/s9hp132Eqh87D8Ke6";

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d821.2!2d-58.2457728!3d-34.7356557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a32fbc702a46d1%3A0x2e8f2cdaecef4511!2sServicio%20y%20Mantenimiento%20Computadoras!5e0!3m2!1ses-419!2sar!4v1726400000000!5m2!1ses-419!2sar";

export default function MapSection() {
  return (
    <section className="w-full pt-8 sm:pt-10 pb-2">
      <h2 className="font-heading font-bold text-paper text-2xl sm:text-3xl mb-5 text-center px-6">
        Dónde estamos
      </h2>

      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] overflow-hidden border-y border-border">
        <iframe
          src={MAPS_EMBED_URL}
          title="Servicio y Mantenimiento Computadoras — Feo & Sistems en Google Maps"
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <p className="text-muted text-sm text-center mt-3 px-6">
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors underline-offset-2 hover:underline"
        >
          {DIRECCION} · Abrir en Google Maps
        </a>
      </p>
    </section>
  );
}
