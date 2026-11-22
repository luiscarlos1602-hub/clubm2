import { KeyRound } from "lucide-react";
import { BulletList, Eyebrow, IconTile, IndexLabel } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SystemSection } from "./SystemSection";

/** Muestra el mismo bloque en los cuatro tonos (ADR-010): nada cambia en el marcado, solo data-tone. */
export function SystemTones() {
  const t = C.tonos;
  return (
    <SystemSection id="tonos-titulo" testId="sistema-tonos" eyebrow={t.eyebrow} title={t.title} description={t.description}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {t.samples.map((s, i) => (
          <li
            key={s.tone}
            data-tone={s.tone}
            data-testid={`tono-${s.tone}`}
            className="flex flex-col gap-4 rounded-2xl border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <IconTile icon={KeyRound} />
              <IndexLabel n={i + 1} />
            </div>
            <Eyebrow>{s.name}</Eyebrow>
            <p className="font-heading text-xl font-semibold">{t.sampleTitle}</p>
            <p className="text-sm text-muted-foreground">{s.use}</p>
            <BulletList items={t.sampleBullets} marker="dash" className="text-sm" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm">{t.primary}</Button>
              <Button size="sm" variant="outline">
                {t.secondary}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </SystemSection>
  );
}
