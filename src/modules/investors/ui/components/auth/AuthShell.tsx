import type { ReactNode } from "react";
import { brand } from "@/shared/config/brand";
import { BrandSymbol, LegalNotice, Wordmark } from "@/shared/ui/brand";
import { BulletList, Eyebrow } from "@/shared/ui/layout";
import { AUTH_COPY } from "./copy";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
  "data-testid"?: string;
  /** Id de ruta del mapa: marca el contenedor como `pagina-<id>`. */
  pageId: string;
};

/** Dos columnas en escritorio (panel de marca oscuro + formulario claro); apilado en móvil. Pone el único h1. */
export function AuthShell({ eyebrow, title, lead, children, "data-testid": testId, pageId }: AuthShellProps) {
  const C = AUTH_COPY.brandPanel;
  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2" data-testid={`pagina-${pageId}`} data-route-id={pageId} data-screen={testId}>
      <aside
        data-tone="dark"
        aria-label={brand.name}
        className="relative flex flex-col justify-between gap-10 overflow-hidden bg-background px-5 py-10 text-foreground md:px-10 lg:px-16 lg:py-16"
      >
        <BrandSymbol
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-16 size-72 text-line/20 lg:size-[28rem]"
        />
        <Wordmark size="md" />
        <div className="relative flex flex-col gap-6">
          <Eyebrow>{C.eyebrow}</Eyebrow>
          <p className="font-heading text-3xl leading-tight font-light text-balance md:text-5xl">{brand.tagline}</p>
          <span aria-hidden className="h-px w-12 bg-line" />
          <BulletList items={[...C.points]} marker="check" />
        </div>
      </aside>
      <section data-tone="light" className="flex items-center bg-background px-5 py-10 text-foreground md:px-10 lg:px-16 lg:py-16">
        <div className="mx-auto flex w-full max-w-md flex-col gap-7">
          <header className="flex flex-col gap-3">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
            <p className="text-muted-foreground">{lead}</p>
          </header>
          {children}
          <LegalNotice notice="demoBanner" variant="inline" />
        </div>
      </section>
    </div>
  );
}
