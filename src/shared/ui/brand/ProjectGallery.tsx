"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/shared/lib/utils";
import { ProjectImage, type ProjectImageVariant } from "./ProjectImage";
import { ProjectionLabel } from "./ProjectionLabel";
import { PROJECT_MEDIA_COPY } from "./project-media-copy";
import type { TestIdProp } from "./types";

const G = PROJECT_MEDIA_COPY.gallery;
const ALL_VARIANTS: readonly ProjectImageVariant[] = ["antes", "despues", "proyeccion"];

export type ProjectGalleryProps = TestIdProp & {
  code: string;
  name: string;
  defaultVariant?: ProjectImageVariant;
  /** URL por variante (imágenes elegidas). Sin esta prop, las tres SVG por código; con ella, solo las variantes con URL. */
  images?: Partial<Record<ProjectImageVariant, string>>;
};

/** Pestañas Antes · Después · Proyección (render). Teclado: flechas, Inicio y Fin. */
export function ProjectGallery({
  code,
  name,
  defaultVariant = "despues",
  images,
  className,
  "data-testid": testId = "project-gallery",
}: ProjectGalleryProps) {
  const variants = images ? ALL_VARIANTS.filter((v) => Boolean(images[v])) : ALL_VARIANTS;
  const initial = variants.includes(defaultVariant) ? defaultVariant : variants[0];
  const [chosen, setActive] = useState<ProjectImageVariant | undefined>(initial);
  const active = chosen && variants.includes(chosen) ? chosen : initial;
  const uid = useId();
  const refs = useRef<Partial<Record<ProjectImageVariant, HTMLButtonElement | null>>>({});

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = variants.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    const v = variants[next]!;
    setActive(v);
    refs.current[v]?.focus();
  }

  if (!active) return null;

  return (
    <div data-testid={testId} data-active={active} className={cn("flex flex-col gap-3", className)}>
      <div role="tablist" aria-label={G.tablist} className="flex flex-wrap gap-2">
        {variants.map((v, i) => (
          <button
            key={v}
            ref={(el) => {
              refs.current[v] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${v}`}
            aria-selected={active === v}
            aria-controls={`${uid}-panel`}
            tabIndex={active === v ? 0 : -1}
            data-testid={`${testId}-tab-${v}`}
            onClick={() => setActive(v)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "focus-visible:ring-ring rounded-full border px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              active === v
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            {G[v]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${active}`} className="flex flex-col gap-2">
        <ProjectImage
          code={code}
          variant={active}
          src={images?.[active]}
          alt={G.alt[active](name)}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="rounded-2xl"
          data-testid={`${testId}-imagen`}
        />
        {active === "proyeccion" ? (
          <p data-testid={`${testId}-nota-proyeccion`} className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ProjectionLabel placement="inline">{G.projectionNote}</ProjectionLabel>
          </p>
        ) : null}
      </div>
    </div>
  );
}
