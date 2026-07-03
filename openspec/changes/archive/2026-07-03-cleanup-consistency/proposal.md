## Why

Una exploración del código descubrió dos inconsistencias reales en el modelo de sesiones y una capa de código abandonado (restos de un timer anterior, una feature de selección de set a medio construir, un label de dark mode duplicado y ~18 claves i18n huérfanas). Antes de seguir construyendo sobre esta base conviene resolver las inconsistencias y borrar lo muerto para partir limpio.

## What Changes

**Correcciones de modelo (comportamiento):**
- La cadencia del plan pasa a ser coherente: los programas declararán `sessionsPerWeek: 5`, alineado con las 5 sesiones que ya se exigen para avanzar de semana (`MIN_SESSIONS_TO_ADVANCE`). Se revisa el tip que decía "no más de dos veces por semana".
- **BREAKING** La sesión guiada de un programa encadenará **todos** los sets de la fase activa (slow → fast → reverse) como bloques, igual que el modo libre. Hoy solo entrena `sets[0]`; los demás sets de la fase nunca se entrenaban por la vía guiada.

**Eliminación de código muerto:**
- `TrainingView.vue`: quitar `elapsedFormatted`, `circumference`, `phaseDuration`, `dashOffset` (restos del timer de anillo SVG) y todas las ramas de la fase `'ready'`, que `session.js` nunca emite.
- `routines.js`: eliminar `activeSetIndex` y `setActiveSet()` (sustituidos por el encadenado de sets).
- `settings.js`: eliminar `darkModeLabel` (reemplazado por i18n `darkModes.*`).
- `freeMode.js`: eliminar `reset()` (nunca llamado).
- Stores de servicio: eliminar exports nunca usados desde fuera (`sound.enable/disable`, `notifications.requestPermission/cancelAll`) salvo que se usen internamente.
- i18n (`en.json` + `es.json`): eliminar ~18 claves huérfanas de features retiradas (perfil antiguo, flujo "cambiar programa", sueltas).
- Corregir el comentario de fases en `session.js:20` para incluir `'transition'`.

## Capabilities

### New Capabilities
- `guided-session`: comportamiento de la sesión de entrenamiento guiada por un programa — cadencia semanal, avance de semana y encadenado de los sets de la fase activa.

### Modified Capabilities
<!-- Ninguna: openspec/specs/ está vacío; no hay specs previos que modificar. -->

## Impact

- **Código:** `src/stores/routines.js`, `src/stores/session.js`, `src/stores/settings.js`, `src/stores/freeMode.js`, `src/stores/sound.js`, `src/stores/notifications.js`, `src/views/TrainingView.vue`, `src/i18n/en.json`, `src/i18n/es.json`.
- **Tests:** `src/stores/__tests__/session.test.js` y `routines.test.js` pueden necesitar ajustes si cubren `activeSetIndex` o la sesión guiada de un solo set.
- **Datos/usuario:** el encadenado de sets alarga las sesiones guiadas de fases multi-set (cambio visible de comportamiento). No hay migración de datos: el historial guardado no se ve afectado.
- **Sin dependencias nuevas.**
