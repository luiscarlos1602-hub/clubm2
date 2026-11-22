export const brand = {
  name: "Club M²",
  shortName: "M2",
  tagline: "Juntos sumamos metros.",
  /** Para el wordmark: el "²" va como superíndice del mismo color (ADR-009). Nadie vuelve a escribir el nombre a mano. */
  wordmark: { base: "Club M", mark: "²" },
  /** Descriptor que acompaña al logo (imagen de marca, ADR-009). */
  descriptor: "Club de inversión inmobiliaria",
  /** Paleta de la imagen de marca (ADR-009): 4 de marca + 2 funcionales (Musgo texto secundario, Óxido atención). Fuente para /sistema; brand-tokens.test.ts la compara con globals.css. */
  palette: [
    { token: "verde-profundo", name: "Verde Profundo", hex: "#0D1A16" },
    { token: "crema", name: "Crema", hex: "#F2EDE6" },
    { token: "arena", name: "Arena", hex: "#C7B8A6" },
    { token: "salvia", name: "Salvia", hex: "#9AA38F" },
    { token: "musgo", name: "Musgo", hex: "#55615A" },
    { token: "oxido", name: "Óxido", hex: "#8A4A2C" },
  ],
} as const;

export type Brand = typeof brand;
export type BrandColorToken = (typeof brand.palette)[number]["token"];
