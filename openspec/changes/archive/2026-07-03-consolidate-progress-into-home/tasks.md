# Tasks

## 1. Store: getters de progreso
- [x] 1.1 En `src/stores/session.js` añadir getters `totalSessions` (= `history.length`), `weekCount` (= `weekActivity.filter(Boolean).length`) y `streak` (lógica movida desde `InsightsView`), y exportarlos.
- [x] 1.2 (Opcional) Cubrir los nuevos getters en `src/stores/__tests__/session.test.js`.

## 2. Home: bloque de progreso
- [x] 2.1 En `TrainingView.vue`, tras la card de Modo Libre y antes del tip de recuperación, añadir un bloque "Progreso".
- [x] 2.2 Añadir los stat tiles (total · esta semana · racha) usando los getters del store.
- [x] 2.3 Mantener `WeeklyChart` (consistencia) y `EffortChart` (esfuerzo) dentro/junto al bloque; no reintroducir el gráfico de barras de actividad semanal de Insights.
- [x] 2.4 Añadir el historial de sesiones: mostrar las últimas ~5 por defecto y un desplegable "Ver todo" (patrón `<details>`/acordeón como el "Desglose por semana" de `ProgramDetailView`) que expande el resto in-situ.
- [x] 2.5 Conservar el empty state del historial cuando no hay sesiones.
- [x] 2.6 Reutilizar las claves i18n `insights.*` necesarias para los labels (título, totalSessions, thisWeek, currentStreak, history, noSessions…).

## 3. Eliminar la pantalla de progreso
- [x] 3.1 Borrar `src/views/InsightsView.vue`.
- [x] 3.2 Quitar la ruta `/insights` de `src/router/index.js`.

## 4. Eliminar la BottomNav
- [x] 4.1 Borrar `src/components/BottomNav.vue`.
- [x] 4.2 En `src/App.vue` quitar el import de `BottomNav`, el computed `showNav` y el `<BottomNav v-if="showNav" />`.
- [x] 4.3 En `src/views/ProgramView.vue` quitar el `pb-28` que reservaba hueco para la nav (ajustar el padding inferior).
- [x] 4.4 Restaurar el acceso de retorno perdido con la nav: añadir botón "volver" (`←`) junto al título en `ProgramView.vue` (patrón de `ProgramDetailView`), con `goBack` que vuelve atrás si hay historial y cae a `/training` si se entró directo. Sin la nav, la lista de planes se quedaba sin salida.

## 5. Limpieza i18n
- [x] 5.1 Eliminar las claves `nav.today`, `nav.progress` y `nav.plans` de `src/i18n/en.json` y `src/i18n/es.json`.

## 6. Verificación
- [x] 6.1 Comprobar que ninguna referencia a `/insights`, `BottomNav` o `nav.*` queda en el código.
- [x] 6.2 Revisar `e2e/program-selection.spec.js` por si dependía de la bottom nav; ajustar si aplica. (No dependía: navega vía el link `a[href="#/program"]` de la card de la home.)
- [x] 6.3 Verificar en la app: home muestra progreso e historial colapsable; planes y resto de pantallas sin barra inferior.
