/** Ancho y márgenes de página: cabecera, secciones y pie comparten este contenedor. */
export const PAGE_CONTAINER = "mx-auto w-full max-w-7xl px-5 md:px-10";

export type SurfaceTone = "light" | "paper" | "sand" | "dark";

/** Aire vertical de las secciones (la portada usa lg; listas y formularios, md). */
export const SECTION_SPACING = { sm: "py-12 md:py-16", md: "py-16 md:py-20", lg: "py-20 md:py-28" } as const;
export type SectionSpacing = keyof typeof SECTION_SPACING;
