/**
 * Carrusel infinito con logos SVG locales en /public/brands/
 */
const BRANDS: { name: string; file: string; large?: boolean }[] = [
  { name: "Aorus", file: "aorus.svg", large: true },
  { name: "Kingston", file: "kingston.svg" },
  { name: "Wacom", file: "wacom.svg", large: true },
  { name: "Dell", file: "dell.svg" },
  { name: "Adata", file: "adata.png", large: true },
  { name: "PNY", file: "pny.svg", large: true },
  { name: "WD", file: "wd.svg" },
  { name: "Nvidia", file: "nvidia.svg" },
  { name: "Asus", file: "asus.svg", large: true },
  { name: "AMD", file: "amd.svg", large: true },
  { name: "MSI", file: "msi.svg" },
  { name: "Corsair", file: "corsair.svg" },
  { name: "Redragon", file: "redragon.svg" },
  { name: "Cooler Master", file: "coolermaster.svg" },
  { name: "Gigabyte", file: "gigabyte.svg", large: true },
  { name: "Intel", file: "intel.svg", large: true },
  { name: "Razer", file: "razer.svg" },
  { name: "Logitech", file: "logitech.svg" },
  { name: "HyperX", file: "hyperx.svg", large: true },
  { name: "PlayStation", file: "playstation.svg" },
  { name: "Sony", file: "sony.svg", large: true },
];

export default function BrandMarquee() {
  const loop = [...BRANDS, ...BRANDS];

  return (
    <div
      className="border-b border-border bg-surface overflow-hidden"
      aria-label="Marcas con las que trabajamos"
    >
      <div className="relative py-8 sm:py-10">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 z-10 bg-gradient-to-r from-surface to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 z-10 bg-gradient-to-l from-surface to-transparent"
          aria-hidden
        />

        <div className="brand-marquee-track flex w-max items-center gap-14 sm:gap-20 px-8">
          {loop.map((brand, i) => (
            <div
              key={`${brand.file}-${i}`}
              className={
                brand.large
                  ? "flex items-center justify-center shrink-0 h-16 sm:h-20 w-[9rem] sm:w-[11rem]"
                  : "flex items-center justify-center shrink-0 h-12 sm:h-14 w-[7.5rem] sm:w-[9rem]"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/brands/${brand.file}`}
                alt={brand.name}
                title={brand.name}
                className={
                  brand.large
                    ? "max-h-16 sm:max-h-20 max-w-full w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                    : "max-h-12 sm:max-h-14 max-w-full w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                }
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes brand-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .brand-marquee-track {
          animation: brand-marquee 55s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
