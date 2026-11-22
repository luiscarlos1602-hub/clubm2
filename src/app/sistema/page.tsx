import type { Metadata } from "next";
import { DemoBanner, SectionHeading, Wordmark } from "@/shared/ui/brand";
import { SHOWCASE_COPY } from "@/shared/ui/showcase/showcase-copy";
import { SystemBadges } from "@/shared/ui/showcase/SystemBadges";
import { SystemButtons } from "@/shared/ui/showcase/SystemButtons";
import { SystemFigures } from "@/shared/ui/showcase/SystemFigures";
import { SystemLegal } from "@/shared/ui/showcase/SystemLegal";
import { SystemPalette } from "@/shared/ui/showcase/SystemPalette";
import { SystemProjectCard } from "@/shared/ui/showcase/SystemProjectCard";
import { SystemStates } from "@/shared/ui/showcase/SystemStates";
import { SystemTypography } from "@/shared/ui/showcase/SystemTypography";

export const metadata: Metadata = {
  title: "Sistema",
  robots: { index: false, follow: false },
};

export default function SistemaPage() {
  return (
    <main data-testid="sistema-page">
      <DemoBanner variant="bar" data-testid="demo-banner-fijo" />
      <header className="mx-auto flex max-w-7xl flex-col gap-12 px-5 py-16 md:px-10 md:py-24">
        <Wordmark size="lg" withTagline />
        <SectionHeading level={1} {...SHOWCASE_COPY.intro} />
      </header>
      <SystemPalette />
      <SystemTypography />
      <SystemButtons />
      <SystemBadges />
      <SystemProjectCard />
      <SystemFigures />
      <SystemLegal />
      <SystemStates />
    </main>
  );
}
