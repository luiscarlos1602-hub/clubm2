import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { PROJECT_MEDIA_COPY } from "./project-media-copy";
import type { TestIdProp } from "./types";

export type ProjectImageVariant = "antes" | "despues" | "proyeccion";

export function projectImageSrc(
  code: string,
  variant: ProjectImageVariant,
): `/images/proyectos/${string}/${ProjectImageVariant}.svg` {
  return `/images/proyectos/${code.toLowerCase()}/${variant}.svg`;
}

export type ProjectImageProps = TestIdProp & {
  code: string;
  variant: ProjectImageVariant;
  alt: string;
  priority?: boolean;
  sizes?: string;
};

/** Ilustración de referencia del proyecto (16:10). Siempre lleva el rótulo "Imagen de referencia". */
export function ProjectImage({
  code,
  variant,
  alt,
  className,
  priority,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  "data-testid": testId = "project-image",
}: ProjectImageProps) {
  return (
    <figure
      data-testid={testId}
      data-variant={variant}
      className={cn("bg-muted relative aspect-[16/10] w-full overflow-hidden", className)}
    >
      <Image
        src={projectImageSrc(code, variant)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      <figcaption
        data-testid={`${testId}-referencia`}
        className="bg-primary/80 text-primary-foreground absolute bottom-2 left-2 rounded-full px-2.5 py-1 font-mono text-[11px] tracking-wide"
      >
        {PROJECT_MEDIA_COPY.referenceTag}
      </figcaption>
    </figure>
  );
}
