"use client";

import { useWatch } from "react-hook-form";
import { PROJECT_IMAGE_KINDS, type ProjectImageKind, type ReferenceImageOption } from "@/modules/projects";
import { ProjectImage, type ProjectImageVariant } from "@/shared/ui/brand";
import { cn } from "@/shared/lib/utils";
import { Surface } from "@/shared/ui/layout";
import { PUBLISH_REQUIRED_IMAGE_KINDS } from "../../../../domain/project-sheet-requirements";
import { FieldIssues, type StepProps } from "./SheetControls";
import { SHEET_COPY } from "./copy";

const C = SHEET_COPY.images;
const VARIANT: Record<ProjectImageKind, ProjectImageVariant> = { before: "antes", after: "despues", projection: "proyeccion" };

/** Paso 6 · una ilustración de referencia por tipo, elegida de la biblioteca local (sin subida de archivos). */
export function StepImages({ form, issues, library }: StepProps & { library: readonly ReferenceImageOption[] }) {
  const chosen = useWatch({ control: form.control, name: "images" });
  function pick(kind: ProjectImageKind, url: string) {
    form.setValue(`images.${kind}`, chosen[kind] === url ? "" : url, { shouldDirty: true });
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{C.intro}</p>
      {PROJECT_IMAGE_KINDS.map((kind) => {
        const options = library.filter((o) => o.kind === kind);
        const required = PUBLISH_REQUIRED_IMAGE_KINDS.includes(kind);
        return (
          <Surface key={kind} padding="md" className="gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id={`ficha-imagenes-${kind}`} className="font-heading text-lg font-semibold">{C.kinds[kind]}</h3>
              <span className="text-xs text-muted-foreground">{required ? C.required : C.optional}</span>
            </div>
            <div role="radiogroup" aria-labelledby={`ficha-imagenes-${kind}`} className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid={`ficha-imagenes-${kind}`}>
              {options.map((option, n) => {
                const selected = chosen[kind] === option.url;
                return (
                  <button
                    key={option.url}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${option.label} · ${C.kinds[kind]}`}
                    onClick={() => pick(kind, option.url)}
                    data-testid={`ficha-imagen-${kind}-${n}`}
                    className={cn("overflow-hidden rounded-xl border-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50", selected ? "border-primary" : "border-border")}
                  >
                    <ProjectImage code="referencia" variant={VARIANT[kind]} src={option.url} alt={C.referenceAlt(C.kinds[kind], n + 1)} sizes="(min-width: 768px) 20vw, 45vw" data-testid={`ficha-imagen-vista-${kind}-${n}`} />
                    <span className="block px-2 py-1.5 text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {chosen[kind] === "" ? <p className="text-xs text-muted-foreground">{C.none}</p> : null}
          </Surface>
        );
      })}
      <FieldIssues field="images" issues={issues} />
    </div>
  );
}
