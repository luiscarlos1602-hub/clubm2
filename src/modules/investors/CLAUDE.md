# modules/investors
Inversionista: acceso (maqueta visual), panel, portafolio, cuenta y CRM del backoffice (ADR-012). Último en el orden de módulos antes de `club · crm`: puede importar `projects`, `participations` y `finance` por su `index.ts` o su `ui.ts`.
- `index.ts`: tipos y lógica (vacío hasta que se interconecte). `ui.ts`: pantallas para `app/` (no lo importa `composition`).
- Maqueta (ADR-012): los datos de ejemplo viven en `ui/components/*/examples.ts`, son literales en centavos y citan su origen (semillas M2-00X o caso C#). Ninguna pantalla calcula dinero.
- El acceso es de demostración: no se valida, guarda ni envía ninguna contraseña.
- Sin ruedas fuera de `ui/components/admin/**`.
