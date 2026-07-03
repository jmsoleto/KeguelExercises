## 1. Cadencia semanal (Decisión 1)

- [x] 1.1 Cambiar `sessionsPerWeek` de 2 a 5 en los tres programas de `src/stores/routines.js`
- [x] 1.2 Reescribir el tip de "Máxima Intensidad" que dice "no lo hagas más de dos veces por semana" para no contradecir la cadencia de 5/semana
- [x] 1.3 Verificar en TrainingView y ProgramDetailView que "X/semana" y "Día X/5" muestran la misma cadencia

## 2. Sesión guiada encadena todos los sets (Decisión 2)

- [x] 2.1 En `routines.js`, exponer los bloques de la fase activa como array (mapear cada `phase.sets[i]` a un bloque con `type`, `reps`, `contractSeconds`, `restSeconds`, `reverseSeconds` y `labelKey`), reutilizando el patrón de `freeMode.buildBlocks`
- [x] 2.2 En `TrainingView.vue`, hacer que `startSession()` pase el array completo de bloques a `session.startSession(blocks, { name })` en lugar de un solo set
- [x] 2.3 Eliminar `activeSetIndex` y `setActiveSet` de `routines.js` (store + `return`)
- [x] 2.4 Eliminar la lectura de `routines.activeSetIndex` en `TrainingView.vue:423` y simplificar el `computed` `routine`/construcción de bloques
- [x] 2.5 Generalizar la etiqueta de bloque (`freeBlockLabel`) para que aparezca también en sesiones guiadas multi-bloque (resolver open question: `totalBlocks > 1` vs `isFreeMode`)
- [x] 2.6 Confirmar que `totalMinutes` en la tarjeta refleja la suma de todos los bloques de la fase (no solo el primero)

## 3. Borrado de código muerto (Decisión 3)

- [x] 3.1 `TrainingView.vue`: eliminar `elapsedFormatted`, `circumference`, `phaseDuration`, `dashOffset`
- [x] 3.2 `TrainingView.vue`: eliminar las ramas de la fase `'ready'` en `repFillPct`, `phaseLabel`, `phaseSubtext`, `auraColor` y el overlay de privacidad
- [x] 3.3 `settings.js`: eliminar `darkModeLabel` (store + `return`)
- [x] 3.4 `freeMode.js`: eliminar `reset()` (store + `return`)
- [x] 3.5 `sound.js` / `notifications.js`: verificar uso interno y, si no lo hay, quitar del `return` los exports no usados (`sound.enable/disable`, `notifications.requestPermission/cancelAll`)
- [x] 3.6 `session.js`: corregir el comentario de fases (línea ~20) para incluir `'transition'`

## 4. Limpieza i18n

- [x] 4.1 Eliminar de `en.json` y `es.json` las claves huérfanas de perfil: `weeklyConsistency`, `currentPlan`, `security`, `spanish`, `english`, `support`, `helpCenter`, `contactSupport`, `termsPrivacy`, `logout`
- [x] 4.2 Eliminar las claves del flujo "cambiar programa": `program.changeProgram`, `confirmChangeTitle`, `confirmChangeBody`, `yesChange`, `currentPhase`
- [x] 4.3 Eliminar las claves sueltas: `training.pelvicActivation`, `noActiveProgram`, `chooseAProgram`, `session`, `type`, `durationRep`, `reverse`
- [x] 4.4 Reconfirmar paridad de claves en/es tras el borrado (deben quedar igual número en ambos)

## 5. Tests y verificación

- [x] 5.1 Actualizar `session.test.js` / `routines.test.js` para reflejar el encadenado de sets en la sesión guiada y la eliminación de `activeSetIndex`
- [x] 5.2 Ejecutar la suite de tests y dejarla en verde
- [x] 5.3 Verificar a mano una sesión guiada de una fase multi-set (p.ej. Maestría de "Control Total"): se entrenan todos los bloques con transición y etiqueta correcta
