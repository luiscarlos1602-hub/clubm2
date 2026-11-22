# modules/finance
Motor único de reparto 25/75 (docs/02, skill `motor-reparto`). Ninguna pantalla calcula dinero.
- API pública: `index.ts` (`calculateDistribution`, `validateDistributionInput`, `calculateHolderPayout`).
- Invariantes: fondo + empresa = excedente al centavo; residuo de redondeo a la empresa (K1); `basis` rotula proyección vs realizado.
- Tests canónicos `C1…C6` y propiedades I1–I9 (fast-check): no los cambies sin ADR.
- Redondeo solo vía `shared/domain/money.ts`; sin `Date`, `Math.random` ni React en `domain/`.
- Trampa: las funciones de `Money` lanzan `RangeError` ante precondiciones violadas; valida antes (`validateDistributionInput`).
- En pérdida (C5) no hay reparto: `LOSS_POLICY_UNDEFINED` hasta que se defina H2.
