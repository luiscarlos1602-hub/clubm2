import { brand, type BrandColorToken } from "@/shared/config/brand";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SystemSection } from "./SystemSection";

/** Color de texto legible sobre cada muestra (sin literales: tokens de marca). */
const INK: Record<BrandColorToken, string> = {
  cal: "text-grafito",
  grafito: "text-cal",
  "verde-avila": "text-cal",
  arcilla: "text-cal",
  "arcilla-clara": "text-cal",
  laton: "text-grafito",
  piedra: "text-cal",
};
const BG: Record<BrandColorToken, string> = {
  cal: "bg-cal",
  grafito: "bg-grafito",
  "verde-avila": "bg-verde-avila",
  arcilla: "bg-arcilla",
  "arcilla-clara": "bg-arcilla-clara",
  laton: "bg-laton",
  piedra: "bg-piedra",
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
