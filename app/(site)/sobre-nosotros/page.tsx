import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description: "Quiénes somos y por qué documentamos casos técnicos reales de construcción.",
  alternates: { canonical: "/sobre-nosotros" },
};

const PILARES = [
  {
    number: "Transparencia no solo como forma de atención, sino como método de trabajo.",
    title: "",
    text: "Nuestro objetivo no es aparentar que todo tiene reparación. Nuestro objetivo es determinar con honestidad qué puede repararse, qué conviene reparar y cuándo una reparación deja de ser técnicamente o económicamente razonable.",
  },
  {
    number: "Reparar ≠ volver atrás. Reparar es extender la vida de la tecnología.",
    title: "",
    text: "Nuestro trabajo no consiste únicamente en conseguir que un equipo vuelva a encender. Buscamos comprender qué ocurrió, encontrar la causa del problema y determinar cuál es la solución técnica más conveniente para cada caso",
  },
  {
    number: "Reparar también es hacerse responsable",
    title: "",
    text: "Cada reparación que realizamos cuenta con su correspondiente garantía, porque creemos que un trabajo profesional no termina cuando el equipo vuelve a funcionar. Respaldamos lo que hacemos y asumimos la responsabilidad sobre nuestra intervención.",
  },
  {
    number: "El cliente debe entender qué está pagando.",
    title: "",
    text: "Buscamos ofrecer diagnósticos claros, explicar las alternativas disponibles y diferenciar una reparación necesaria de una intervención que simplemente incrementaría el costo sin aportar una mejora real.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <div className="pt-32 pb-24">
      {/* Intro */}
      <header className="max-w-5xl mx-auto px-6 mb-3xl">
        <p className="font-heading text-accent text-sm font-semibold mb-2">
          Tecnología que merece seguir funcionando
        </p>
        <h1 className="font-heading font-bold text-paper text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          Sobre Nosotros
        </h1>
        <p className="text-muted text-lg mt-6 text-justify">
          Antes de reemplazar un equipo, vale la pena preguntarse. ¿realmente necesita ser
          reemplazado?
        </p>
      </header>

      {/* Historia */}
      <section className="max-w-5xl mx-auto px-6 py-3xl border-t border-border">
        <p className="font-heading text-sm text-muted mb-4">NUESTRA HISTORIA</p>
        <p className="font-heading text-2xl md:text-3xl leading-snug text-paper text-justify">
          Nuestro origen se encuentra en el oficio y la experiencia de más de 25 años de trabajo
          técnico especializado.{" "}
          <span className="text-muted">
            Comenzamos desde cero, construyendo nuestro espacio, nuestras herramientas y nuestra
            clientela de manera progresiva, mientras el servicio técnico convivía con otras
            actividades laborales necesarias para sostener el proyecto. Hoy comenzamos una nueva
            etapa: convertir aquello que durante años fue un emprendimiento sostenido a pulmón en
            una actividad profesional dedicada plenamente al diagnóstico, mantenimiento y
            reparación de equipos informáticos.
          </span>
        </p>
      </section>

      {/* Pilares */}
      <section className="max-w-6xl mx-auto px-6 py-3xl border-t border-border">
        <h2 className="font-heading font-bold text-paper text-3xl mb-10">
          Nuestra forma de trabajar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILARES.map((p) => (
            <div key={p.number} className="border border-border rounded-xl p-6">
              <span className="font-heading text-accent text-sm">{p.number}</span>
              <h3 className="font-heading font-semibold text-paper text-xl mt-3 mb-2">
                {p.title}
              </h3>
              <p className="text-muted text-sm text-justify">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Qué hacemos */}
      <section className="max-w-5xl mx-auto px-6 py-3xl border-t border-border">
        <h2 className="font-heading font-bold text-accent text-3xl md:text-4xl leading-tight mb-10">
          ¿Qué hacemos?
        </h2>

        <div className="space-y-12">
          <div>
            <h3 className="font-heading font-semibold text-paper text-xl md:text-2xl mb-3">
              Mantenimiento correctivo
            </h3>
            <p className="text-muted text-lg leading-relaxed text-justify">
              No se trata simplemente de “formatear una computadora”. Primero buscamos identificar
              el problema y determinar su origen para aplicar una solución adecuada, procurando
              recuperar la estabilidad, funcionalidad y confiabilidad del equipo.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-paper text-xl md:text-2xl mb-3">
              Troubleshooting
            </h3>
            <p className="text-muted text-lg leading-relaxed text-justify">
              Para nosotros, reparar comienza por entender. Diagnosticar correctamente significa
              aislar el problema, realizar comprobaciones y descartar hipótesis, en lugar de
              sustituir componentes al azar.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-paper text-xl md:text-2xl mb-3">
              Microelectrónica y reparación a nivel de componente
            </h3>
            <p className="text-muted text-lg leading-relaxed text-justify">
              Cuando una falla se encuentra en el nivel electrónico, reemplazar una placa completa
              no siempre es la única alternativa. La reparación a nivel de componente busca
              localizar y solucionar fallas específicas dentro de una placa electrónica mediante
              técnicas de diagnóstico, medición, microsoldadura e intervención sobre sus
              componentes y circuitos.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusión final */}
      <section className="max-w-5xl mx-auto px-6 py-3xl border-t border-border">
        <h2 className="font-heading font-bold text-accent text-3xl md:text-4xl leading-tight mb-10">
          Más que reparar
        </h2>

        <div>
          <h3 className="font-heading font-semibold text-paper text-xl md:text-2xl mb-3">
            La tecnología evoluciona constantemente. También lo hacemos nosotros.
          </h3>
          <p className="text-muted text-lg leading-relaxed text-justify">
            Lo que comenzó como un pequeño emprendimiento familiar construido desde cero
            se encuentra hoy en una nueva etapa, con la intención de profesionalizar cada vez
            más nuestro trabajo y profundizar nuestras capacidades técnicas.
            Porque detrás de cada computadora hay una inversión, una herramienta de trabajo,
            un medio de estudio, un proyecto o simplemente algo que alguien quiere seguir utilizando.
            Y mientras exista una posibilidad razonable de devolverle la vida, creemos que merece ser considerada.
            <br />
            <br />
            Feo & Sistems
            <br />
            Diagnosticar. Reparar. Extender la vida útil de la tecnología.
          </p>
        </div>
      </section>
    </div>
  );
}
