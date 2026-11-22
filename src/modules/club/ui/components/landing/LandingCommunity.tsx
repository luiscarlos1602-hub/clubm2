import { BookOpen, CalendarRange, HardHat, MessagesSquare, type LucideIcon } from "lucide-react";
import { BrandSymbol, SectionHeading } from "@/shared/ui/brand";
import { Section } from "@/shared/ui/layout";
import { LANDING_COPY } from "../../copy";

const C = LANDING_COPY.community;
const ICONS: readonly LucideIcon[] = [MessagesSquare, HardHat, BookOpen, CalendarRange];

export function LandingCommunity() {
  return (
    <Section ruled labelledBy="comunidad-titulo" data-testid="portada-comunidad" className="overflow-hidden" innerClassName="flex flex-col gap-12">
      <BrandSymbol className="pointer-events-none absolute -top-10 -right-24 hidden size-[22rem] text-line/20 lg:block" />
      <SectionHeading id="comunidad-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} />
      <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {C.items.map((item, i) => {
          const Icon = ICONS[i] ?? MessagesSquare;
          return (
            <li key={item.title} className="flex flex-col gap-3">
              <Icon aria-hidden className="size-6" />
              <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
