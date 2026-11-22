import type { RouteCopy } from "./route-copy-types";

export const PUBLIC_ROUTES_COPY: Readonly<Record<"p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7" | "p8", RouteCopy>> = {
  p1: {
    navLabel: "Inicio",
    title: "Así funciona el club",
    phrase:
      "Aquí verás cómo la empresa compra inmuebles con capital propio, los reforma y los vende, y cómo se reparte el excedente entre el fondo de participaciones y la empresa.",
    emptyTitle: "La portada está en construcción",
    emptyDescription:
      "Esta sección mostrará: la propuesta del club, el recorrido compra → reforma → venta → reparto y sus riesgos, explicados con claridad.",
    nextLabel: "Ver cómo será el registro",
  },
  p2: {
    navLabel: "Vista previa del registro",
    title: "Registro (vista previa)",
    phrase: "Aquí crearás tu perfil, nos contarás tu experiencia y leerás los riesgos antes de participar.",
    emptyTitle: "El registro aún no está abierto",
    emptyDescription: "Es una vista previa: por ahora no se guarda ningún dato.",
    nextLabel: "Ver proyectos",
  },
  p3: {
    navLabel: "Proyectos",
    title: "Proyectos",
    phrase: "Aquí verás cada proyecto con su etapa, las participaciones disponibles y el plazo objetivo como proyección.",
    emptyTitle: "Aún no se muestran los proyectos simulados",
    emptyDescription: "Los proyectos simulados aparecerán aquí.",
    nextLabel: "Ver un proyecto de ejemplo",
  },
  p4: {
    navLabel: "Proyecto",
    title: "Ficha del proyecto",
    phrase: "Aquí verás el inmueble, el presupuesto desglosado, los escenarios y un simulador del reparto del excedente.",
    emptyTitle: "La ficha de este proyecto aún no está disponible",
    emptyDescription: "Esta sección mostrará: evidencia, cronograma de obra, actualizaciones fechadas y riesgos.",
    nextLabel: "Ver la pantalla de reserva simulada",
  },
  p5: {
    navLabel: "Participar",
    title: "Participar en el proyecto",
    phrase:
      "Aquí elegirás cuántas participaciones económicas reservar, revisarás el resumen y aceptarás los riesgos. La reserva será simulada.",
    emptyTitle: "La reserva aún no está habilitada",
    emptyDescription: "Ninguna reserva de esta demo es una operación real.",
    nextLabel: "Ir a mi portafolio",
  },
  p6: {
    navLabel: "Mi portafolio",
    title: "Mi portafolio",
    phrase: "Aquí verás, por separado, tu capital aportado, la ganancia realizada y la proyección de cada proyecto.",
    emptyTitle: "Aún no tienes participaciones",
    emptyDescription: "Aquí aparecerán las participaciones simuladas.",
    nextLabel: "Explorar proyectos",
  },
  p7: {
    navLabel: "El club",
    title: "El club",
    phrase: "Aquí encontrarás los eventos, las charlas y la academia del club.",
    emptyTitle: "Aún no hay eventos publicados",
    emptyDescription: "La agenda y la academia se publicarán aquí.",
    nextLabel: "Explorar proyectos",
  },
  p8: {
    navLabel: "Mi cuenta",
    title: "Mi cuenta",
    phrase: "Aquí verás tu perfil, el estado de tu verificación (simulada) y tus notificaciones.",
    emptyTitle: "Tu perfil aún no tiene datos",
    emptyDescription: "La verificación de esta demo es simulada.",
    nextLabel: "Ir a mi portafolio",
  },
};
