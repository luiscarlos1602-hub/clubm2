"use client";

import { useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/primitives/select";
import { DEMO_ROLES, ROLE_HOME, isDemoRole, type Zone } from "./demo-role";
import { useActiveRole, useDemoRoleStore } from "./role-store";
import { SHELL_COPY } from "./shell-copy";

export type RoleSwitcherProps = TestIdProp & { zone: Zone };

export function RoleSwitcher({ zone, className, "data-testid": testId = "selector-rol" }: RoleSwitcherProps) {
  const router = useRouter();
  const id = useId();
  const hintId = `${id}-pista`;
  const role = useActiveRole(zone);
  const setRole = useDemoRoleStore((s) => s.setRole);

  useEffect(() => {
    void useDemoRoleStore.persist.rehydrate();
  }, []);

  return (
    <div className={cn("flex items-center gap-2", className)} title={SHELL_COPY.roleHint}>
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {SHELL_COPY.roleSwitcherLabel}
      </label>
      <Select
        value={role}
        onValueChange={(next) => {
          if (!isDemoRole(next)) return;
          setRole(next);
          router.push(ROLE_HOME[next]);
        }}
      >
        <SelectTrigger id={id} aria-describedby={hintId} data-testid={testId} className="h-11 min-w-36 bg-background md:h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {DEMO_ROLES.map((r) => (
            <SelectItem key={r} value={r} data-testid={`${testId}-${r}`} className="min-h-10">
              {SHELL_COPY.roles[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    <span id={hintId} className="sr-only">
        {SHELL_COPY.roleHint}
      </span>
    </div>
  );
}
