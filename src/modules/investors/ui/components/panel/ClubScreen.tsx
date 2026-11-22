import Link from "next/link";
import { ArrowRight, CalendarDays, GraduationCap, HardHat } from "lucide-react";
import { routeHref } from "@/shared/ui/app-shell";
import { StatusBadge } from "@/shared/ui/brand";
import { BulletList, Eyebrow, IconTile, PageHeader, Section, Surface } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY.club;
const ICONS = { eventos: CalendarDays, academia: GraduationCap, visitas: HardHat } as const;

/** P7 · Club: vitrina en futuro ("Así funcionará"); nada de esto está disponible todavía. */
export function ClubScreen() {
  return (
    <div data-testid="pagina-p7" data-route-id="p7" className="flex flex-col">
      <PageHeader id="titulo-p7" eyebrow={C.eyebrow} title={C.title} description={C.description} />
      <Section tone="light" spacing="md" label={C.willBe} innerClassName="flex flex-col gap-6">
        <Eyebrow>{C.willBe}</Eyebrow>
        <ul className="grid gap-6 lg:grid-cols-3">
          {C.sections.map((s) => (
            <Surface as="li" key={s.id} padding="lg" data-testid={`club-${s.id}`}>
              <div className="flex items-start justify-between gap-4">
                <IconTile icon={ICONS[s.id]} />
                <StatusBadge tone="neutral" label={C.tbd} />
              </div>
              <h2 className="font-heading text-2xl font-medium">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.text}</p>
              <BulletList items={[...s.items]} marker="dot" className="text-sm" />
            </Surface>
          ))}
        </ul>
      </Section>
      <Section tone="sand" spacing="md" labelledBy="club-cierre-titulo" innerClassName="flex flex-col items-start gap-4">
        <h2 id="club-cierre-titulo" className="font-heading text-2xl font-medium md:text-3xl">{C.closing.title}</h2>
        <p className="text-muted-foreground max-w-[60ch]">{C.closing.text}</p>
        <Button asChild variant="outline">
          <Link href={routeHref("p3")}>
            {C.closing.cta}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </Section>
    </div>
  );
}
