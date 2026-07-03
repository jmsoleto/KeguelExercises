## Context

La app entrena el suelo pélvico con dos vías: **programas guiados** (`routines.js` → fases con uno o varios `sets`) y **modo libre** (`freeMode.js` → el usuario encadena bloques). Ambas alimentan el mismo timer por bloques en `session.js`, que ya soporta múltiples bloques con descansos de transición (`TRANSITION_REST`).

El modo libre usa el timer multi-bloque correctamente. La vía guiada, en cambio, quedó a medias: `activeSetIndex` existe y se lee, pero nada lo cambia (`setActiveSet` nunca se llama), así que el timer guiado siempre arranca con `phase.sets[0]` y descarta el resto de sets de la fase. En paralelo, los programas anuncian `sessionsPerWeek: 2` mientras el avance de semana exige 5 (`MIN_SESSIONS_TO_ADVANCE`), mostrando dos cadencias contradictorias al usuario.

## Goals / Non-Goals

**Goals:**
- Que la sesión guiada entrene la fase completa (todos sus sets), reutilizando el encadenado por bloques que ya funciona en modo libre.
- Cadencia semanal coherente en toda la UI (tarjeta de plan, "Día X/N", avance de semana).
- Dejar el árbol sin código muerto identificado en la exploración.

**Non-Goals:**
- Rediseñar el timer o las animaciones del orbe.
- Añadir UI de selección manual de set (se descarta esa dirección; ver Decisión 2).
- Cambiar el contenido de los programas (reps/duraciones de las fases) más allá de `sessionsPerWeek` y el tip afectado.
- Migrar datos de historial.

## Decisions

### Decisión 1 — Cadencia: 5 sesiones/semana
Se ajusta el **dato** a la realidad del avance: `sessionsPerWeek: 5` en los tres programas, y se conserva `MIN_SESSIONS_TO_ADVANCE = 5`. Se reescribe el tip de "Máxima Intensidad" que dice "no lo hagas más de dos veces por semana" para no contradecir la cadencia.
- *Alternativa descartada:* bajar `MIN_SESSIONS_TO_ADVANCE` a 2. Se descarta porque la progresión ("Día X/5") ya está pensada en torno a 5 y bajarla aceleraría demasiado el avance de 12 semanas.

### Decisión 2 — La sesión guiada encadena todos los sets de la fase
`startSession` ya acepta un array de bloques. La vía guiada construirá el array a partir de **todos** los `phase.sets` (mapeando cada set a un bloque con `labelKey`, como hace `freeMode.buildBlocks`) y lo pasará a `startSession(blocks, { name })`. Se eliminan `activeSetIndex` y `setActiveSet`.
- *Alternativa descartada:* mantener "un set por sesión" añadiendo UI para elegir set. Se descarta: más superficie de UI, y conceptualmente una "sesión" de una fase es su protocolo completo, no un fragmento.
- *Consecuencia:* la etiqueta de bloque (`freeBlockLabel`) que hoy solo aparece en modo libre debería mostrarse también en la sesión guiada multi-bloque, para que el usuario sepa qué ejercicio toca. A decidir en implementación si se generaliza `isFreeMode` o se usa `totalBlocks > 1`.

### Decisión 3 — Borrado de código muerto (sin alternativas)
Restos verificados con 0 usos externos: computeds del anillo SVG (`elapsedFormatted`, `circumference`, `phaseDuration`, `dashOffset`), ramas de fase `'ready'` (nunca emitida por el store), `settings.darkModeLabel`, `freeMode.reset`, y claves i18n huérfanas. Se borran directamente.

## Risks / Trade-offs

- **[Sesiones guiadas más largas]** Las fases multi-set (p.ej. Maestría: slow+fast+reverse) pasan a durar bastante más. → Es el comportamiento correcto pretendido; se comunica visualmente con `totalMinutes`, que ya suma todos los bloques.
- **[Tests rojos]** Tests que asuman un solo set en la vía guiada o cubran `activeSetIndex` fallarán. → Actualizarlos como parte del cambio; validan justamente el nuevo comportamiento.
- **[Borrar un export usado internamente]** Algún export "muerto" de los service stores podría usarse dentro del propio store. → Verificar uso interno antes de borrar (`sound.enable`, `notifications.requestPermission`); si se usan internamente, solo quitar del `return`.

## Migration Plan

Cambio puramente de código; sin migración de datos ni feature flags. Rollback = revertir el commit. El historial persistido (`keguel_history`) y las settings no cambian de formato.

## Open Questions

- La etiqueta de bloque en la sesión guiada, ¿se activa por `session.totalBlocks > 1` (más general) o se mantiene atada a `isFreeMode`? Resolver al implementar la Decisión 2.
