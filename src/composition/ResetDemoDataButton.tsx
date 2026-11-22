"use client";

import { useState, type ReactElement } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/primitives/button";
import { DEMO_RESET_COPY } from "@/shared/ui/brand/demo-copy";
import { useResetDemoData } from "./use-reset-demo-data";

type Step = "idle" | "confirming" | "done";

export function ResetDemoDataButton({ className }: { readonly className?: string }): ReactElement {
  const [step, setStep] = useState<Step>("idle");
  const { reset, isResetting } = useResetDemoData();

  async function confirm(): Promise<void> {
    try {
      await reset();
      setStep("done");
    } catch (error) {
      console.error("No se pudo reiniciar los datos simulados", error);
      setStep("idle");
    }
  }

  return (
    <div className={cn("flex flex-col gap-2 text-sm", className)}>
      {(step === "idle" || step === "done") && (
        <Button variant="outline" size="sm" data-testid="demo-reset-button" onClick={() => setStep("confirming")}>
          {DEMO_RESET_COPY.action}
        </Button>
      )}
      {step === "confirming" && (
        <div role="group" aria-label={DEMO_RESET_COPY.action} className="flex flex-col gap-2">
          <p className="text-muted-foreground">{DEMO_RESET_COPY.warning}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              data-testid="demo-reset-confirm"
              disabled={isResetting}
              onClick={() => void confirm()}
            >
              {DEMO_RESET_COPY.confirm}
            </Button>
            <Button variant="ghost" size="sm" data-testid="demo-reset-cancel" onClick={() => setStep("idle")}>
              {DEMO_RESET_COPY.cancel}
            </Button>
          </div>
        </div>
      )}
      <p role="status" aria-live="polite" data-testid={step === "done" ? "demo-reset-done" : undefined}>
        {step === "done" ? DEMO_RESET_COPY.done : null}
      </p>
    </div>
  );
}
