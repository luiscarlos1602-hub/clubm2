# ADR-013 · Ajustes de producto sobre la maqueta (%, imágenes, riesgos, reserva, visitas)
Estado: **aceptado** (decisión del usuario, 22-nov-2026, revisión de la maqueta ADR-012)
Fecha: 2026-11-22
Relacionado: ADR-004, ADR-010, ADR-011, ADR-012; `docs/06`

## Contexto
Al recorrer la maqueta el usuario pidió cambios de producto antes de interconectar: mostrar el % junto a la ganancia, imágenes antes/después, simulador solo donde se puede participar, riesgos como términos y condiciones (sin repetirlos en exceso), tablero de proceso del inmueble, reserva abierta a todos con contacto de un asesor, agendar visitas a obra y un backoffice más detallado y visual.

## Decisión
1. **% generado junto a toda ganancia** (realizada o proyectada): "Ganancia realizada USD 172,50 · 34,5 %". El % lo calcula solo el motor (`calculateProfitRate` en `modules/finance`: ganancia / capital, en pb, hacia abajo); ninguna pantalla lo calcula. Un % proyectado lleva el mismo rótulo de proyección que su cifra. Nunca en frases tipo "ganas X %" (R1 de `check-copy` sigue vigente).
2. **Imágenes**: cada proyecto tiene imágenes de referencia **antes**, **después** y **proyección** (render). Al inicio son ilustraciones de referencia rotuladas como tales (`public/images/proyectos/<código>/`), reemplazables por fotos reales sin cambiar la API (`ProjectImage`).
3. **Simulador solo en proyectos abiertos a participar** (fase `open`). En proyectos donde ya participas o que no admiten participación, no hay simulador: se muestra el proceso, los resultados y, si aplica, la proyección fija. Al **reservar** se muestra una estimación para la cantidad elegida (motor).
4. **Riesgos como términos y condiciones**: página `/terminos` con los riesgos y condiciones, que se acepta en el registro y al reservar. El aviso de riesgo se menciona **en puntos clave** (simulador, reserva, cifras de proyección principales, pie), no en cada tarjeta. Sustituye la regla F1-5 "toda tarjeta con cupos lleva el aviso de riesgo cercano". El descargo del simulador (docs/06 regla 4) se mantiene.
5. **Tablero del proceso del inmueble** con hitos y tiempos estimados (proyección): inicio de obra · obra 50 % · obra 80 % · inicio de venta · en venta · vendida.
6. **Reserva abierta a todos** (sin iniciar sesión): tras reservar, "Un asesor te contactará para confirmar tu participación". Sigue siendo simulada en la demo.
7. **Agendar visita a obra** desde los proyectos donde participas (fecha y franja preferidas → confirmación de que el equipo contactará).
8. **Backoffice**: menú lateral con iconos y desplegable; vistas de detalle por oportunidad y por proyecto (participaciones disponibles, estado, presupuesto, proceso), con gráficas (Recharts).

## Consecuencias
- `docs/06` se actualiza (regla de % y frecuencia del aviso de riesgo).
- `revisor-cumplimiento` deja de exigir el aviso en cada tarjeta; exige el % con su rótulo y que provenga del motor.
- Riesgo abierto: mostrar % (incluso rotulado) aumenta la lectura como rentabilidad esperada; revisar con asesoría legal antes de abrir al público (F5).
