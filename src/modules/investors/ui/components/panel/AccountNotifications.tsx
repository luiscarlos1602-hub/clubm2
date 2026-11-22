"use client";

import { useState } from "react";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY.account;

/** Interruptores de ejemplo: el estado vive solo en esta vista, no se guarda ni se envía nada. */
export function AccountNotifications() {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(C.notifications.map((n) => [n.id, n.on])));
  return (
    <fieldset className="flex flex-col gap-3" data-testid="cuenta-notificaciones">
      <legend className="text-muted-foreground mb-2 text-sm">{C.notificationsHint}</legend>
      {C.notifications.map((n) => (
        <label key={n.id} className="border-border flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-sm">
          <input
            type="checkbox"
            checked={on[n.id] ?? false}
            onChange={(e) => setOn((prev) => ({ ...prev, [n.id]: e.target.checked }))}
            data-testid={`cuenta-notificacion-${n.id}`}
            className="focus-visible:ring-ring size-4 accent-[var(--primary)] focus-visible:ring-2 focus-visible:outline-none"
          />
          {n.label}
        </label>
      ))}
      <p className="text-muted-foreground text-sm">{C.saveNote}</p>
    </fieldset>
  );
}
