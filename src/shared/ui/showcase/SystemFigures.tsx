import { MoneyDisplay } from "@/shared/ui/brand";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SAMPLE_CAPITAL, SAMPLE_PROJECTION, SAMPLE_REALIZED } from "./showcase-samples";
import { SystemSection } from "./SystemSection";

export function SystemFigures() {
  return (
    <SystemSection id="cifras-titulo" testId="sistema-cifras" {...C.cifras}>
      <div className="flex flex-col gap-10">
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          <MoneyDisplay value={SAMPLE_CAPITAL} kind="capital" size="lg" data-testid="cifra-capital" />
          <MoneyDisplay value={SAMPLE_REALIZED} kind="realized" size="lg" decimals="auto" data-testid="cifra-realizado" />
          <MoneyDisplay value={SAMPLE_PROJECTION} kind="projection" size="lg" data-testid="cifra-proyeccion" />
        </div>
        <div className="flex flex-col gap-3 border-t border-laton/70 pt-8">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{C.cifras.bigLabel}</p>
          <MoneyDisplay value={SAMPLE_CAPITAL} kind="capital" size="xl" data-testid="cifra-protagonista" />
        </div>
        <p className="text-xs text-muted-foreground">{C.cifras.example}</p>
      </div>
    </SystemSection>
  );
}
