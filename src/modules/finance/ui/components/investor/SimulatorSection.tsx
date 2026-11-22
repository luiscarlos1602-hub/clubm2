"use client";

import { useMemo } from "react";
import { Section } from "@/shared/ui/layout";
import { Surface } from "@/shared/ui/layout";
import { maxHeldFor, toSimulatorBase } from "../../hooks/project-figures";
import { useSimulator } from "../../hooks/use-simulator";
import type { ProjectDetailData } from "../../hooks/use-project-detail";
import { PROJECT_DETAIL_COPY } from "./copy";
import { SimulatorControls } from "./SimulatorControls";
import { SimulatorResultPanel } from "./SimulatorResultPanel";

const C = PROJECT_DETAIL_COPY.simulator;

/** Simulador de la ficha (CA3). El retraso solo alarga el plazo proyectado. */
export function SimulatorSection({ data }: { data: ProjectDetailData }) {
  const base = useMemo(() => toSimulatorBase(data), [data]);
  const simulator = useSimulator(base);
  return (
    <Section tone="sand" spacing="md" ruled labelledBy="titulo-simulador" innerClassName="flex flex-col gap-8" data-testid="seccion-simulador">
      <div className="flex max-w-[60ch] flex-col gap-3">
        <h2 id="titulo-simulador" className="font-heading text-3xl font-medium">
          {C.title}
        </h2>
        <p className="text-muted-foreground">{C.description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Surface padding="lg">
          <h3 className="font-heading text-xl font-medium">{C.controlsTitle}</h3>
          <SimulatorControls simulator={simulator} salePrice={simulator.result.salePrice} total={base.total} maxHeld={Math.max(1, maxHeldFor(data))} />
        </Surface>
        <SimulatorResultPanel result={simulator.result} requestedHeld={simulator.controls.held} />
      </div>
    </Section>
  );
}
