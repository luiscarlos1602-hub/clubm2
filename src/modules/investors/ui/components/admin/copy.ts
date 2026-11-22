/** Textos del backoffice de inversionistas y CRM (B6). Maqueta con datos de ejemplo (ADR-012). */
export const CRM_COPY = {
  eyebrow: "Backoffice · B6",
  title: "Inversionistas y CRM",
  description:
    "Leads, embudo de registro, habilitación y primera participación, y origen de cada contacto. Personas y cifras de ejemplo.",
  kpis: {
    heading: "Indicadores",
    leads: "Leads este mes",
    ticket: "Ticket promedio de reserva",
    ticketHint: "Valor de ejemplo, no una meta.",
    conversion: "Del registro a la primera participación",
  },
  funnel: {
    heading: "Embudo",
    description: "Cuántas personas llegan a cada paso. Cifras de ejemplo.",
    steps: { lead: "Contacto", registered: "Registro", enabled: "Habilitación", invested: "Primera participación" },
  },
  origin: { heading: "Origen de los contactos", description: "Participación de cada canal en los contactos de ejemplo." },
  leads: {
    heading: "Leads recientes",
    filterLabel: "Filtrar por paso",
    all: "Todos los pasos",
    name: "Contacto",
    city: "Ciudad",
    origin: "Origen",
    step: "Paso",
    date: "Fecha",
    ticket: "Ticket",
    tableLabel: "Leads recientes",
    emptyTitle: "Ningún lead en este paso",
    emptyDescription: "Elige otro paso o muestra todos.",
    noTicket: "—",
    contact: "Contactar",
    contacted: "Maqueta: el contacto quedaría registrado. No se guardó nada.",
  },
} as const;
