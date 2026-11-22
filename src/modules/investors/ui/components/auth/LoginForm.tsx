"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { FormEvent } from "react";
import { routeHref, useDemoRoleStore } from "@/shared/ui/app-shell";
import { Button } from "@/shared/ui/primitives/button";
import { AuthShell } from "./AuthShell";
import { AUTH_COPY } from "./copy";
import { Field } from "./Field";

const C = AUTH_COPY.login;

/** Maqueta de acceso: fija el rol de la demo y navega al panel. No valida, guarda ni envía credenciales. */
export function LoginForm() {
  const router = useRouter();
  const setRole = useDemoRoleStore((s) => s.setRole);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRole("investor");
    router.push(routeHref("panel"));
  }

  return (
    <AuthShell eyebrow={C.eyebrow} title={C.title} lead={C.lead} pageId="login" data-testid="ingresar-pantalla">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" data-testid="ingresar-formulario">
        <Field
          id="email"
          type="email"
          autoComplete="email"
          label={AUTH_COPY.fields.email}
          placeholder={AUTH_COPY.fields.emailPlaceholder}
          data-testid="ingresar-correo"
        />
        <Field
          id="password"
          type="password"
          autoComplete="off"
          label={AUTH_COPY.fields.password}
          placeholder={AUTH_COPY.fields.passwordPlaceholder}
          data-testid="ingresar-clave"
        />
        <p className="rounded-lg border border-line bg-card px-3.5 py-3 text-sm text-muted-foreground" data-testid="ingresar-aviso-demo">
          {AUTH_COPY.demoNotice}
        </p>
        <Button type="submit" size="lg" className="h-11" data-testid="ingresar-entrar">
          {C.submit}
          <ArrowRight aria-hidden />
        </Button>
      </form>
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-muted-foreground">
          {C.registerPrompt}{" "}
          <Link href={routeHref("p2")} className="font-medium text-foreground underline underline-offset-4" data-testid="ingresar-registro">
            {C.registerLink}
          </Link>
        </p>
        <Link href={routeHref("b1")} onClick={() => setRole("admin")} className="w-fit font-medium text-foreground underline underline-offset-4" data-testid="ingresar-equipo">
          {C.teamLink}
        </Link>
      </div>
    </AuthShell>
  );
}
