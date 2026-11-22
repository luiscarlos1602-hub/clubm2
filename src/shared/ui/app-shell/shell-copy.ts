import type { DemoRole } from "./demo-role";

export const SHELL_COPY = {
  skipToContent: "Saltar al contenido",
  navLabel: {
    public: "Navegación principal",
    investor: "Navegación del inversionista",
    admin: "Navegación del backoffice",
  },
  menuOpen: "Abrir menú",
  menuTitle: "Menú",
  roleSwitcherLabel: "Simular rol",
  roles: { visitor: "Visitante", investor: "Inversionista", admin: "Admin" },
  zoneTag: { public: "", investor: "Zona del inversionista", admin: "Backoffice" },
  roleHint: "Solo cambia la vista de la demo. No es un inicio de sesión.",
  exampleScreen: "Pantalla de ejemplo: aún sin datos ni funciones reales.",
  footerNote: "Plataforma en construcción: lo que ves es el mapa del producto. Todo el contenido es de ejemplo.",
} as const satisfies { roles: Record<DemoRole, string> } & Record<string, unknown>;
