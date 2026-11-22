import { usdUnits } from "@/shared/domain/money";
import { formatMoney } from "@/shared/lib/format-money";

/** Precio de referencia de una participación (maestro: 100 × USD 100). Literal de marketing, no un cálculo. */
export const REFERENCE_UNIT_PRICE = usdUnits(100);
const UNIT = formatMoney(REFERENCE_UNIT_PRICE);

/** Textos de la portada P1 (docs/06, marketing/03). Revisión: skill copy-sin-promesas + check-copy. */
export const LANDING_COPY = {
  hero: {
    titleLead: "Participa",
    titleRest: "en proyectos inmobiliarios, metro a metro.",
    lead: `Un club para aprender y participar en proyectos de reforma inmobiliaria. Compramos con capital propio, reformamos y vendemos. Cuando abra el registro, podrás participar en la reforma desde ${UNIT} y seguir cada paso: la compra, la obra, los números y la venta.`,
    primaryCta: "Ver cómo será el registro",
    secondaryCta: "Explorar proyectos de ejemplo",
    note: "Registro gratuito y abierto. Sin compromiso de inversión.",
    visualLabel: "Recorrido de un proyecto del club",
    visualSteps: ["Compra documentada", "Obra con avances publicados", "Venta a la vista", "Resultado línea por línea"],
  },
  pillars: {
    label: "Así funcionará el club",
    items: [
      { title: "Ves todo", text: "Compra, presupuesto, obra, venta y resultado, con fechas, fotos y responsables." },
      { title: "Empiezas pequeño", text: `Participaciones económicas de ${UNIT} por proyecto. El registro es gratis.` },
      { title: "Nosotros ponemos primero", text: "La empresa compra cada inmueble con su propio capital antes de ofrecer participaciones." },
      { title: "Aprendes en comunidad", text: "Charlas, academia, visitas a obra y preguntas abiertas." },
      { title: "Te decimos los riesgos", text: "Escenarios conservador, base y optimista, explicados antes de decidir." },
    ],
  },
  how: {
    eyebrow: "Cómo funciona",
    title: "Cuatro pasos, cada uno a la vista",
    description: "Así recorre un proyecto el club, desde que compramos el inmueble hasta que repartimos el resultado.",
    steps: [
      {
        title: "Compramos",
        text: "Elegimos el inmueble, hacemos la revisión legal y técnica y lo compramos con capital propio. Publicamos la fecha, el precio y el estado en que llega.",
      },
      {
        title: "Reformamos",
        text: "La reforma tiene un presupuesto desglosado. Los inversionistas financian solo esa reforma con participaciones económicas. Publicamos avances, gastos y desvíos.",
      },
      {
        title: "Vendemos",
        text: "Al terminar la obra, el inmueble sale a la venta. El plazo es un objetivo, no una fecha cierta.",
      },
      {
        title: "Repartimos",
        text: "Con la venta se calcula el excedente y se reparte. Te mostramos el resultado realizado, línea por línea.",
      },
    ],
  },
  distribution: {
    eyebrow: "El reparto",
    title: "Cómo se reparte el excedente",
    description:
      "El excedente es lo que queda de la venta después de restar la compra, el presupuesto integral de la reforma y los costos de venta.",
    fundLabel: "Fondo de participaciones",
    fundText: "Se divide entre todas las participaciones del proyecto.",
    companyLabel: "Empresa",
    companyText: "Compra el inmueble, dirige la obra y vende.",
    barLabel: "Reparto del excedente entre el fondo de participaciones y la empresa",
    notes: [
      "Tu parte del fondo depende de cuántas participaciones tengas del total del proyecto.",
      "En una liquidación con excedente, el resultado se muestra en dos cifras separadas: tu capital aportado y tu parte del fondo. No se garantiza ninguna de las dos.",
      "Si el inmueble se vende con pérdida, no hay reparto del fondo: los participantes absorben el 25 % de la pérdida y la empresa el 75 %, sin perder más de lo aportado. El aporte puede recuperarse solo en parte; no se devuelve dinero antes de la venta.",
    ],
    simulatorHint: "En cada ficha de proyecto podrás simular tu participación con distintos escenarios.",
  },
  participation: {
    eyebrow: "Tu participación",
    title: "Qué tienes cuando participas",
    items: [
      "Una participación económica en el resultado de un proyecto concreto.",
      "Acceso a la ficha completa: compra, presupuesto, avances y venta.",
      "La empresa mantiene la propiedad legal del inmueble.",
      "Cada proyecto tiene su propio inmueble, presupuesto y caja.",
    ],
  },
  risks: {
    eyebrow: "Riesgos",
    title: "Lo que puede salir mal, dicho antes",
    items: [
      "La obra puede costar más de lo presupuestado.",
      "La obra o la venta pueden tardar más que el plazo objetivo.",
      "El inmueble puede venderse por debajo del escenario base, o no venderse en el plazo previsto.",
      "Puedes perder parte o la totalidad de tu aporte.",
    ],
  },
  community: {
    eyebrow: "Comunidad",
    title: "Aprendemos juntos, caso por caso",
    description: "Esto ofrecerá el club: no es solo un lugar para participar en proyectos, es donde se explica cómo funciona una operación inmobiliaria por dentro.",
    items: [
      { title: "Charlas abiertas", text: "Cada proyecto se presenta y se discute en comunidad, con preguntas abiertas al equipo." },
      { title: "Visitas a obra", text: "Ver la reforma en persona, con quien la dirige." },
      { title: "Academia", text: "Cómo se compra, se presupuesta, se reforma y se vende, explicado sin tecnicismos." },
      { title: "Reportes con fecha", text: "Actualizaciones de obra y de venta, con lo que avanzó, lo que costó y lo que cambió." },
    ],
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Lo que nos suelen preguntar",
    items: [
      {
        q: "¿Puedo invertir hoy?",
        a: "Todavía no. Esta es una demo con datos simulados y no recibimos inversiones. Puedes conocer el club, explorar proyectos de ejemplo y ver cómo será el registro.",
      },
      {
        q: "¿Esto es una pirámide?",
        a: "Cada proyecto tiene su propio inmueble, presupuesto y caja, y se publican los números de cada uno.",
      },
      {
        q: "¿Cuánto voy a ganar?",
        a: "Depende de la venta real y de los costos. Te mostramos escenarios y, al final, el resultado realizado. No prometemos cifras.",
      },
      {
        q: "¿Y si el inmueble no se vende?",
        a: "Las opciones posibles son ajustar el precio, alquilar o conservar el inmueble. El detalle se publicará en la ficha de cada proyecto.",
      },
      {
        q: "¿La casa pasa a ser mía?",
        a: "No. La empresa mantiene la propiedad legal; tú tienes una participación económica en el resultado del proyecto.",
      },
      {
        q: "¿Por qué confiar en ustedes?",
        a: "Porque el modelo es que la empresa compra primero con su capital y publica los números de cada proyecto, incluidos los desvíos.",
      },
    ],
  },
  closing: {
    lead: "Conoce los proyectos de ejemplo y cómo será el registro.",
    pillars: ["Inversión", "Proyectos", "Comunidad", "Resultados"],
  },
} as const;
