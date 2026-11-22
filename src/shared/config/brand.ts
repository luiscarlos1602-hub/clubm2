export const brand = {
  name: "Club M²",
  shortName: "M2",
  tagline: "Juntos sumamos metros.",
  /** Para el wordmark: el "²" va en Latón. Nadie vuelve a escribir el nombre a mano. */
  wordmark: { base: "Club M", mark: "²" },
  /** Fuente para mostrar la paleta en /sistema; brand-tokens.test.ts la compara con globals.css. */
  palette: [
    { token: "cal", name: "Cal", hex: "#F4EFE6" },
    { token: "grafito", name: "Grafito noche", hex: "#16181A" },
    { token: "verde-avila", name: "Verde Ávila", hex: "#1F3A33" },
    { token: "arcilla", name: "Arcilla", hex: "#9A4529" },
    { token: "arcilla-clara", name: "Arcilla clara", hex: "#B5573A" },
    { token: "laton", name: "Latón", hex: "#B8935A" },
    { token: "piedra", name: "Piedra", hex: "#6B655C" },
  ],
} as const;

export type Brand = typeof brand;
export type BrandColorToken = (typeof brand.palette)[number]["token"];
