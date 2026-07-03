## Context

El perfil actual (`stores/profile.js`) solo guarda `name`. El arranque se gatea con `keguel_onboarded` (router → carrusel de onboarding). Los tres programas (`stores/routines.js`) son de facto masculinos (control eyaculatorio, erección, orgasmo). No existe concepto de sexo ni de contenido femenino.

Se decide una **identidad única por dispositivo, redefinible** (no multi-perfil), porque no tiene sentido que varias personas compartan la app en un mismo dispositivo. Esto evita el mayor coste técnico (namespacing de las ~10 claves `keguel_*`) y descarta cualquier migración de datos.

## Goals / Non-Goals

**Goals:**
- Capturar nombre + sexo en el primer arranque con una pantalla animada y agradable.
- No volver a preguntar si el sexo ya está definido.
- Usar el sexo para filtrar contenido: masculino operativo, femenino "Próximamente".
- Permitir redefinir la identidad desde Perfil.

**Non-Goals:**
- Multi-usuario / perfiles múltiples / namespacing de datos.
- Autorar el contenido de ejercicios femeninos (queda para un cambio futuro).
- Rediseñar el carrusel de onboarding existente.
- Migrar o transformar datos guardados.

## Decisions

### Decisión 1 — Identidad única en el store de perfil
`profile.js` añade `sex` (`'male' | 'female' | null`). `null` = usuario no creado. Se persiste en `keguel_profile` junto a `name`. Función `setIdentity(name, sex)` que valida y guarda. `hasIdentity` = `sex !== null`.
- *Alternativa descartada:* store `users` con lista + activo. Descartada por la Decisión de identidad única.

### Decisión 2 — Gate de arranque: sexo → onboarding → training
El guard del router redirige a `/welcome` si `!hasIdentity` (salvo que ya se vaya a `/welcome`). Tras crear identidad, sigue el gate de `keguel_onboarded` existente. La pantalla de creación se **antepone** al carrusel; no lo sustituye.
- *Alternativa descartada:* fundir creación y carrusel en un solo flujo. Descartada para no tocar el onboarding que ya funciona.

### Decisión 3 — El sexo condiciona el contenido; femenino = "Próximamente"
Los programas se marcan con `sex: 'male'`. La UI de programas/training/modo libre comprueba `profile.sex`:
- `male`: comportamiento actual.
- `female`: estado "Próximamente" en training, programas y modo libre (todo el path de ejercicio queda aparcado).
Perfil, historial e insights siguen accesibles para ambos sexos.
- *Alternativa descartada:* dejar el modo libre disponible para mujeres. El usuario prefiere aparcar también el modo libre hasta tener contenido femenino coherente.

### Decisión 4 — Cambiar de identidad desde Perfil
Botón "Cambiar de usuario" que reabre `/welcome` (permitido aunque ya haya identidad). Al guardar:
- Si el nuevo sexo es `female` y había programa activo → se llama a `routines.resetProgram()` para desactivarlo (el historial en `keguel_history` no se toca).
- El nombre se actualiza siempre.

### Decisión 5 — SVGs inline hechos a mano, animados con CSS
Dos escenas independientes (hombre / mujer), cada una como bloque `<svg>` inline con grupos `<g>` nombrados (cuerpo, brazo que saluda, elemento ambiental). Estilo del prompt: faceless, formas planas, sin degradados. Estados:
- **Idle:** grises (fills gris o `filter: grayscale(1)`), ambiente oculto.
- **Selected** (clase `.selected` al pulsar): fills a color + `@keyframes wave` en el brazo + animación ambiental (p.ej. sol que sube en ♂, pájaro que cruza en ♀) que aparece.
Sin librerías: solo CSS keyframes y toggle de clase reactivo desde Vue.

## Risks / Trade-offs

- **[Usuarias femeninas sin nada que hacer]** Tras crear identidad, una mujer solo ve "Próximamente". → Aceptado y explícito: se captura el sexo ya para no re-preguntar cuando llegue el contenido; el estado comunica claramente que está en camino.
- **[Usuarios existentes forzados a /welcome]** Quien ya usaba la app pasará una vez por la creación. → Es intencional (deben declarar su sexo una vez) y conservan todos sus datos; coste mínimo.
- **[Autoría de los SVG]** Hacer SVG vectoriales creíbles y animados a mano lleva iteración. → Se acota el estilo (plano, faceless) y la animación (wave + un ambiente) para mantenerlo abordable; se puede refinar después sin tocar la lógica.
- **[Cambio de sexo con programa activo]** Podría dejar estado inconsistente. → Mitigado por Decisión 4 (resetProgram al pasar a female).

## Migration Plan

Sin migración de datos. El único efecto sobre instalaciones existentes: al abrir tras el cambio, `profile.sex` es `null` → pasan por `/welcome` una vez. Historial, programa, semana y settings persisten intactos. Rollback = revertir el commit (los usuarios que hubieran fijado `sex` simplemente tendrían un campo extra ignorado).

## Open Questions

- Ninguna crítica pendiente. Detalle a resolver en implementación: la animación ambiental concreta de cada escena (sol/pájaro/gato) se elige al construir los SVG.
