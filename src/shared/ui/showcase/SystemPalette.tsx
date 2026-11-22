import { brand, type BrandColorToken } from "@/shared/config/brand";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SystemSection } from "./SystemSection";

/** Color de texto legible sobre cada muestra (sin literales: tokens de marca). */
const INK: Record<BrandColorToken, string> = {
  "verde-profundo": "text-crema",
  crema: "text-verde-profundo",
  arena: "text-verde-profundo",
  salvia: "text-verde-profundo",
  musgo: "text-crema",
  oxido: "text-crema",
};
const BG: Record<BrandColorToken, string> = {
  "verde-profundo": "bg-verde-profundo",
  crema: "bg-crema",
  arena: "bg-arena",
  salvia: "bg-salvia",
  musgo: "bg-musgo",
  oxido: "bg-oxido",
};

export function SystemPalette() {
  return (
    <SystemSection id="paleta-titulo" testId="sistema-paleta" {...C.paleta}>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {brand.palette.map((c) => (
          <li
            key={c.token}
            data-testid={`swatch-${c.token}`}
            className={`flex aspect-[4/3] flex-col justify-between rounded-md border border-border p-4 ${BG[c.token]} ${INK[c.token]}`}
          >
            <span className="text-xs">{C.paleta.roles[c.token]}</span>
            <span className="flex flex-col">
              <span className="font-heading text-lg">{c.name}</span>
              <span className="font-mono text-xs uppercase">{c.hex}</span>
            </span>
          </li>
        ))}
      </ul>
    </SystemSection>
  );
}
