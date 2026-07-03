## Why

La `BottomNav` sólo aparece en 2 de las 9 pantallas (`insights` y `program`), controlada por `showNav` en `App.vue`. Eso crea una barra que aparece y desaparece —se siente como un bug— y de sus tres pestañas dos son redundantes: "Today" es la raíz y "Planes" ya cuelga de las cards de la home. La única pestaña con acceso propio es **Progreso** (`/insights`), que además duplica contenido: la home ya renderiza `WeeklyChart` y `EffortChart`. Lo único exclusivo de Progreso son los stats globales y el historial de sesiones.

En vez de reubicar el acceso a Progreso, lo fundimos en la home como dashboard único y eliminamos tanto la pantalla `/insights` como la `BottomNav`. Menos pantallas, un solo modelo de navegación coherente.

## What Changes

**Home como dashboard único (`TrainingView.vue`):**
- Nuevo bloque "Progreso" en el estado dashboard, tras la card de Modo Libre y antes del tip de recuperación.
- Se añaden los **stat tiles** (total de sesiones · esta semana · racha) y el **historial de sesiones** (con su empty state), movidos desde `InsightsView`.
- El historial se muestra **colapsado por defecto** (últimas ~5 sesiones) con un desplegable "Ver todo" in-situ, para que la home no crezca sin límite.
- `WeeklyChart` (consistencia) y `EffortChart` (esfuerzo) se mantienen; el gráfico de actividad semanal de Insights se **descarta** por duplicar `WeeklyChart`.

**Eliminación de navegación y pantalla:**
- Borrar `InsightsView.vue` y la ruta `/insights` (`router/index.js`).
- Borrar `BottomNav.vue`; en `App.vue` quitar el import, el computed `showNav` y el `<BottomNav>`.
- `ProgramView.vue` pierde el `pb-28` que reservaba hueco para la nav.

**Refactor de apoyo (`stores/session.js`):**
- Subir al store como getters `totalSessions`, `weekCount` y `streak` (hoy `streak` se calcula sólo dentro de `InsightsView`), junto al ya existente `weekActivity`, para que la home quede declarativa.

**i18n:**
- Reutilizar las claves `insights.*` necesarias para los labels del bloque Progreso en la home.
- Eliminar las claves `nav.*` (`today`, `progress`, `plans`), ya sin uso.

## Capabilities

### New Capabilities
- `home-dashboard`: la home es el único dashboard de la app; concentra el arranque de sesión, el plan y el progreso (stats + historial), sin barra de navegación inferior ni pantalla de progreso separada.

### Modified Capabilities
<!-- Ninguna: guided-session y user-identity no cambian de comportamiento. -->

## Impact

- **Código:** `src/views/TrainingView.vue`, `src/views/InsightsView.vue` (borrado), `src/components/BottomNav.vue` (borrado), `src/App.vue`, `src/router/index.js`, `src/views/ProgramView.vue`, `src/stores/session.js`, `src/i18n/en.json`, `src/i18n/es.json`.
- **Navegación:** desaparece `/insights` como ruta. La raíz sigue redirigiendo a `/training`. Ningún enlace interno apuntaba a `/insights` salvo la propia `BottomNav`.
- **Tests:** revisar `src/stores/__tests__/session.test.js` si conviene cubrir los nuevos getters `streak`/`weekCount`/`totalSessions`. `e2e/program-selection.spec.js` puede referirse a la nav.
- **Datos/usuario:** sin migración; el historial (`keguel_history` en localStorage) no cambia de formato, sólo de lugar de visualización.
- **Sin dependencias nuevas.**
