import type { RouteCopy } from "./route-copy-types";

export const ADMIN_ROUTES_COPY: Readonly<Record<"b1" | "b2" | "b3" | "b4" | "b5" | "b6" | "b7" | "b8" | "b9", RouteCopy>> = {
  b1: {
    navLabel: "Panel",
    title: "Panel de operación",
    phrase: "Aquí verás los indicadores internos: capital inmovilizado, proyectos por etapa y avance de las participaciones reservadas.",
    emptyTitle: "Sin indicadores todavía",
    emptyDescription: "Se calcularán con los datos simulados de los proyectos.",
    nextLabel: "Ver adquisiciones",
  },
  b2: {
    navLabel: "Adquisiciones",
    title: "Adquisiciones",
    phrase: "Aquí seguirás cada oportunidad desde la evaluación y la revisión legal y técnica hasta la compra con capital propio.",
    emptyTitle: "No hay oportunidades en evaluación",
    emptyDescription: "El pipeline de oportunidades aparecerá aquí.",
    nextLabel: "Ver proyecto y obra",
  },
  b3: {
    navLabel: "Proyecto y obra",
    title: "Proyecto y obra",
    phrase:
      "Aquí compararás el presupuesto con el gasto real, seguirás los hitos y publicarás los avances que verá el inversionista.",
    emptyTitle: "Sin obra registrada",
    emptyDescription: "Las órdenes de trabajo y los avances aparecerán aquí.",
    nextLabel: "Ir a comercialización",
  },
  b4: {
    navLabel: "Comercialización",
    title: "Comercialización",
    phrase: "Aquí registrarás la publicación, las visitas, las ofertas y el cierre de la venta.",
    emptyTitle: "Sin inmuebles en venta",
    emptyDescription: "Las publicaciones y las ofertas aparecerán aquí.",
    nextLabel: "Ir a finanzas",
  },
  b5: {
    navLabel: "Finanzas",
    title: "Finanzas y liquidación",
    phrase: "Aquí verás la caja de cada proyecto y harás la liquidación con el motor de reparto 25/75.",
    emptyTitle: "Sin movimientos de caja",
    emptyDescription: "La caja y las liquidaciones aparecerán aquí.",
    nextLabel: "Ver el portafolio del inversionista",
  },
  b6: {
    navLabel: "Inversionistas y CRM",
    title: "Inversionistas y CRM",
    phrase:
      "Aquí seguirás los registros, el embudo desde el registro hasta la primera participación y el origen de cada contacto.",
    emptyTitle: "Sin registros todavía",
    emptyDescription: "Los registros del formulario de registro aparecerán aquí.",
    nextLabel: "Volver al panel",
  },
  b7: {
    navLabel: "Proyectos",
    title: "Proyectos",
    phrase: "Aquí verás todos los inmuebles dados de alta, su etapa y el acceso para crear uno nuevo o editar su ficha.",
    emptyTitle: "Sin inmuebles dados de alta",
    emptyDescription: "Los inmuebles que registres aparecerán aquí.",
    nextLabel: "Dar de alta un inmueble",
  },
  b8: {
    navLabel: "Nuevo inmueble",
    title: "Nuevo inmueble",
    phrase: "Aquí registrarás un inmueble paso a paso: datos, costos, estructura de participaciones e imágenes de referencia.",
    emptyTitle: "Sin datos del inmueble",
    emptyDescription: "Completa los pasos para crear la ficha.",
    nextLabel: "Volver a proyectos",
  },
  b9: {
    navLabel: "Editar inmueble",
    title: "Editar inmueble",
    phrase: "Aquí corregirás los datos, los costos y las imágenes de referencia de un inmueble ya registrado.",
    emptyTitle: "Inmueble no encontrado",
    emptyDescription: "Vuelve al listado y elige otro inmueble.",
    nextLabel: "Volver a proyectos",
  },
};
