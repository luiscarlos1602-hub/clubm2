import Link from "next/link";
import { LegalNotice } from "@/shared/ui/brand";
import { BulletList, PageHeader, Section } from "@/shared/ui/layout";
import { TERMS_COPY } from "./copy";

const C = TERMS_COPY;

/** Términos y condiciones (ADR-013): riesgos y condiciones en un solo lugar. Contenido estático. */
export function TermsScreen() {
  return (
    <div data-testid="pagina-terminos" className="flex flex-col">
      <PageHeader id="titulo-terminos" eyebrow={C.eyebrow} title={C.title} description={C.description} />
      <Section tone="light" spacing="md" label={C.tocLabel} innerClassName="flex flex-col gap-10">
        <nav aria-label={C.tocLabel}>
          <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {C.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="rounded-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {C.sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titulo`} data-testid={`terminos-${s.id}`} className="flex max-w-[72ch] scroll-mt-24 flex-col gap-4">
            <h2 id={`${s.id}-titulo`} className="font-heading text-2xl font-medium md:text-3xl">
              {s.title}
            </h2>
            <BulletList items={s.items} marker={s.id === "riesgos" ? "dash" : "dot"} />
          </section>
        ))}
        <div className="flex flex-col gap-3">
          <LegalNotice notice="riskNotice" />
          <LegalNotice notice="legalPlaceholder" />
          <p className="text-sm text-muted-foreground">{C.updated} {C.footerNote}</p>
          <Link href="/registro" className="w-fit rounded-sm text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            {C.backToRegister}
          </Link>
        </div>
      </Section>
    </div>
  );
}
