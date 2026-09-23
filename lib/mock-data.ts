// Datos ficticios de ejemplo, SIN relación con contenido de terceros,
// usados solo para poder ver y probar la interfaz mientras construimos
// las páginas. En la Fase 6 esto se reemplaza por datos reales desde
// Supabase, cargados a través del panel /admin.

export const productos = [
  { number: "01", name: "Humedad", slug: "humedad", description: "Filtraciones, condensación y moho.", caseCount: 4 },
  { number: "02", name: "Estructura", slug: "estructura", description: "Fisuras, pilares y cimentación.", caseCount: 3 },
  { number: "03", name: "Impermeabilización", slug: "impermeabilizacion", description: "Cubiertas y contenciones.", caseCount: 2 },
  { number: "04", name: "Cubiertas", slug: "cubiertas", description: "Tejados y azoteas.", caseCount: 2 },
  { number: "05", name: "Fachadas", slug: "fachadas", description: "Revestimientos exteriores.", caseCount: 2 },
  { number: "06", name: "Acabados", slug: "acabados", description: "Pavimentos, sanitarios y carpintería.", caseCount: 1 },
  { number: "07", name: "Instalaciones", slug: "instalaciones", description: "Electricidad, fontanería y saneamiento.", caseCount: 1 },
  { number: "08", name: "Aislamiento", slug: "aislamiento", description: "Térmico y acústico.", caseCount: 0 },
];

export const FEATURED_servicios = [
  { number: "01", title: "Fisura en el encuentro de dos muros de carga", category: "Estructura", excerpt: "Un movimiento diferencial entre cimentaciones deja una grieta que crece con el tiempo.", slug: "fisura-encuentro-muros" },
  { number: "02", title: "Filtración bajo el sumidero de una cubierta plana", category: "Impermeabilización", excerpt: "Una lámina mal solapada deja pasar agua hacia el forjado inferior.", slug: "filtracion-sumidero-cubierta" },
  { number: "03", title: "Corrosión en el anclaje de una fachada ventilada", category: "Fachadas", excerpt: "Un anclaje de acero sin protección adecuada frente a la humedad ambiente.", slug: "corrosion-anclaje-fachada" },
  { number: "04", title: "Moho oculto tras un revestimiento estanco", category: "Humedad", excerpt: "Un acabado que no deja transpirar el muro empeora la condensación interior.", slug: "moho-revestimiento-estanco" },
  { number: "05", title: "Pavimento levantado por humedad residual", category: "Acabados", excerpt: "El forjado no llegó a secarse antes de colocar el suelo laminado.", slug: "pavimento-levantado-humedad" },
  { number: "06", title: "Grieta en zapata por apoyo irregular", category: "Estructura", excerpt: "Un terreno mal compactado bajo la cimentación provoca un asiento diferencial.", slug: "grieta-zapata-apoyo-irregular" },
];

// Servicios completa, agrupada por categoría (igual que el patrón
// observado en el sitio de referencia: secciones apiladas por
// categoría en lugar de un grid único).
export const LIBRARY_BY_CATEGORY: Record<
  string,
  { name: string; servicios: { number: string; title: string; excerpt: string; slug: string }[] }
> = {
  humedad: {
    name: "Humedad",
    servicios: [
      { number: "01", title: "Moho oculto tras un revestimiento estanco", excerpt: "Un acabado que no deja transpirar el muro empeora la condensación interior.", slug: "moho-revestimiento-estanco" },
      { number: "02", title: "Condensación intersticial en cerramiento sin barrera de vapor", excerpt: "El vapor interior atraviesa el muro y condensa dentro del aislamiento.", slug: "condensacion-sin-barrera-vapor" },
      { number: "03", title: "Humedad por capilaridad en muro de sótano", excerpt: "El agua del terreno asciende por los poros del material sin ninguna barrera.", slug: "humedad-capilaridad-sotano" },
      { number: "04", title: "Filtración en junta de hormigonado mal sellada", excerpt: "Una junta fría entre dos fases de hormigonado sin impermeabilizar.", slug: "filtracion-junta-hormigonado" },
    ],
  },
  estructura: {
    name: "Estructura",
    servicios: [
      { number: "01", title: "Fisura en el encuentro de dos muros de carga", excerpt: "Un movimiento diferencial entre cimentaciones deja una grieta que crece con el tiempo.", slug: "fisura-encuentro-muros" },
      { number: "02", title: "Grieta en zapata por apoyo irregular", excerpt: "Un terreno mal compactado bajo la cimentación provoca un asiento diferencial.", slug: "grieta-zapata-apoyo-irregular" },
      { number: "03", title: "Armadura expuesta por falta de recubrimiento", excerpt: "El hormigón pierde su capa protectora y el acero queda expuesto a la corrosión.", slug: "armadura-expuesta-recubrimiento" },
    ],
  },
  impermeabilizacion: {
    name: "Impermeabilización",
    servicios: [
      { number: "01", title: "Filtración bajo el sumidero de una cubierta plana", excerpt: "Una lámina mal solapada deja pasar agua hacia el forjado inferior.", slug: "filtracion-sumidero-cubierta" },
      { number: "02", title: "Muro de contención sin drenaje trasero", excerpt: "El agua se acumula contra el muro en lugar de evacuarse hacia un dren.", slug: "muro-contencion-sin-drenaje" },
    ],
  },
  cubiertas: {
    name: "Cubiertas",
    servicios: [
      { number: "01", title: "Encharcamiento en cubierta plana por pendiente insuficiente", excerpt: "El agua no llega a los sumideros y queda estancada tras la lluvia.", slug: "encharcamiento-cubierta-pendiente" },
      { number: "02", title: "Rebosadero de cubierta sin salida libre", excerpt: "Un elemento de seguridad bloqueado deja de cumplir su función en lluvia intensa.", slug: "rebosadero-cubierta-bloqueado" },
    ],
  },
  fachadas: {
    name: "Fachadas",
    servicios: [
      { number: "01", title: "Corrosión en el anclaje de una fachada ventilada", excerpt: "Un anclaje de acero sin protección adecuada frente a la humedad ambiente.", slug: "corrosion-anclaje-fachada" },
      { number: "02", title: "Fisuras por falta de junta de dilatación", excerpt: "Un paño largo sin juntas acumula tensión térmica hasta agrietarse.", slug: "fisuras-junta-dilatacion" },
    ],
  },
  acabados: {
    name: "Acabados",
    servicios: [
      { number: "01", title: "Pavimento levantado por humedad residual", excerpt: "El forjado no llegó a secarse antes de colocar el suelo laminado.", slug: "pavimento-levantado-humedad" },
    ],
  },
  instalaciones: {
    name: "Instalaciones",
    servicios: [
      { number: "01", title: "Ruido de bajante transmitido a la vivienda inferior", excerpt: "Un codo mal resuelto convierte la caída de agua en un golpe sonoro.", slug: "ruido-bajante-codo" },
    ],
  },
  aislamiento: {
    name: "Aislamiento",
    servicios: [],
  },
};

// Ficha completa de un caso de ejemplo, con todas las secciones
// definidas en el brief (problema, causa, consecuencias, solución,
// normativa, coste, galería y vídeo). En la Fase 6 esto se carga
// dinámicamente desde Supabase para cada slug.
export const CASE_DETAILS: Record<
  string,
  {
    number: string;
    title: string;
    subtitle: string;
    category: { name: string; slug: string };
    date: string;
    readTime: string;
    problema: string;
    queOcurrio: string;
    porQueOcurrio: string;
    consecuencias: string;
    solucion: string;
    coste: string;
    normativa: { code: string; description: string }[];
    gallery: { alt: string; caption: string }[];
    videoId: string | null;
    relatedSlugs: string[];
  }
> = {
  "fisura-encuentro-muros": {
    number: "01",
    title: "Fisura en el encuentro de dos muros de carga",
    subtitle:
      "Una grieta que nace en la unión de dos muros no es estética: es la señal visible de un movimiento diferencial entre cimentaciones.",
    category: { name: "Estructura", slug: "estructura" },
    date: "12 de marzo de 2026",
    readTime: "6 min de lectura",
    problema:
      "En el encuentro entre un muro de carga y un muro de cerramiento aparece una fisura vertical que atraviesa varias hiladas. No es una grieta superficial de revoco: continúa por debajo del acabado.",
    queOcurrio:
      "Los dos muros apoyan sobre cimentaciones distintas, con cargas y rigideces diferentes. Con el tiempo, cada una se asienta a un ritmo distinto, y el punto de unión entre ambos muros concentra toda esa diferencia de movimiento en una sola línea.",
    porQueOcurrio:
      "El proyecto no incluyó una junta de dilatación ni un elemento flexible en ese encuentro. Al tratar la unión como si fuera un único elemento rígido, cualquier asiento diferencial del terreno se traduce directamente en una fisura.",
    consecuencias:
      "La fisura tiende a crecer con cada ciclo de temperatura y con nuevos asientos del terreno. Si no se corrige el origen, puede facilitar la entrada de agua y acelerar el deterioro de la armadura interior.",
    solucion:
      "Se ejecuta una junta de dilatación vertical en el encuentro, se sella con un material elástico compatible con el movimiento esperado, y se refuerza puntualmente la zona con malla antifisuras antes del acabado final.",
    coste:
      "Sellado de junta: 15-25 €/ml. Si ya existe daño en el revestimiento, la reparación integral (repicado, refuerzo y acabado) puede rondar los 60-90 €/ml.",
    normativa: [
      {
        code: "CTE DB-SE",
        description: "Exigencias de seguridad estructural y previsión de movimientos diferenciales.",
      },
    ],
    gallery: [
      { alt: "Fisura vertical en el encuentro de dos muros de carga", caption: "Vista general de la fisura en el punto de unión." },
      { alt: "Detalle de la fisura atravesando varias hiladas", caption: "El recorrido continúa bajo el acabado superficial." },
      { alt: "Junta de dilatación ejecutada como solución", caption: "La junta terminada, sellada con material elástico." },
    ],
    videoId: null,
    relatedSlugs: ["grieta-zapata-apoyo-irregular", "armadura-expuesta-recubrimiento", "corrosion-anclaje-fachada"],
  },
};
