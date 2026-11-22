import { formatIsoDate } from "@/shared/lib/format-date";
import { LegalNotice, StatusBadge, type StatusTone } from "@/shared/ui/brand";
import { Eyebrow, IconTile, PageHeader, Section, Surface } from "@/shared/ui/layout";
import { Bell, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { AccountNotifications } from "./AccountNotifications";
import { EXAMPLE_PROFILE, EXAMPLE_VERIFICATION } from "./examples";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY.account;
const TONE: Record<"done" | "review" | "pending", StatusTone> = { done: "positive", review: "in-progress", pending: "neutral" };

function CardTitle({ icon, children }: { icon: typeof Bell; children: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconTile icon={icon} />
      <h2 className="font-heading text-xl font-medium">{children}</h2>
    </div>
  );
}

/** P8 · Cuenta: perfil de ejemplo, verificación simulada, preferencias y notificaciones. */
export function AccountScreen() {
  const profile: readonly (readonly [string, string])[] = [
    [C.fields.name, EXAMPLE_PROFILE.fullName],
    [C.fields.email, EXAMPLE_PROFILE.email],
    [C.fields.city, EXAMPLE_PROFILE.city],
    [C.fields.since, formatIsoDate(EXAMPLE_PROFILE.memberSince, "short")],
  ];
  return (
    <div data-testid="pagina-p8" data-route-id="p8" className="flex flex-col">
      <PageHeader id="titulo-p8" eyebrow={C.eyebrow} title={C.title} description={C.description} />
      <Section tone="light" spacing="md" label={C.profileTitle} innerClassName="grid gap-6 lg:grid-cols-2">
        <Surface padding="lg" data-testid="cuenta-perfil">
          <CardTitle icon={UserRound}>{C.profileTitle}</CardTitle>
          <dl className="grid gap-4">
            {profile.map(([k, v]) => (
              <div key={k} className="border-line flex flex-col gap-1 border-t pt-3">
                <dt className="text-muted-foreground text-sm">{k}</dt>
                <dd className="font-medium break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </Surface>
        <Surface padding="lg" data-testid="cuenta-verificacion">
          <CardTitle icon={ShieldCheck}>{C.verificationTitle}</CardTitle>
          <ul className="grid gap-3">
            {EXAMPLE_VERIFICATION.map((s) => (
              <li key={s.label} className="border-line flex items-center justify-between gap-4 border-t pt-3">
                <span>{s.label}</span>
                <StatusBadge tone={TONE[s.state]} label={C.verification[s.state]} />
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm">{C.verificationNote}</p>
        </Surface>
      </Section>
      <Section tone="sand" spacing="md" label={C.preferencesTitle} innerClassName="grid gap-6 lg:grid-cols-2">
        <Surface padding="lg" data-testid="cuenta-preferencias">
          <CardTitle icon={SlidersHorizontal}>{C.preferencesTitle}</CardTitle>
          <dl className="grid gap-4">
            <div className="border-line flex flex-col gap-1 border-t pt-3">
              <dt className="text-muted-foreground text-sm">{C.currencyLabel}</dt>
              <dd className="font-medium">{C.currencyOptions[0]}</dd>
            </div>
            <div className="border-line flex flex-col gap-1 border-t pt-3">
              <dt className="text-muted-foreground text-sm">{C.languageLabel}</dt>
              <dd className="font-medium">{C.languageOptions[0]}</dd>
            </div>
          </dl>
        </Surface>
        <Surface padding="lg">
          <CardTitle icon={Bell}>{C.notificationsTitle}</CardTitle>
          <AccountNotifications />
        </Surface>
      </Section>
      <Section tone="light" spacing="sm" label={C.noticeLabel}>
        <Eyebrow>{C.eyebrow}</Eyebrow>
        <LegalNotice notice="legalPlaceholder" />
      </Section>
    </div>
  );
}
