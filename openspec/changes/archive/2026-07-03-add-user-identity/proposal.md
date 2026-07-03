## Why

Los ejercicios de suelo pélvico difieren según el sexo, pero la app hoy no conoce el sexo del usuario (el perfil solo guarda un nombre) y todo el contenido de programas es masculino. Necesitamos capturar la identidad del usuario (nombre + sexo) en el primer arranque mediante una pantalla acogedora y animada, y usar el sexo para decidir qué contenido mostrar. El contenido femenino aún no existe, así que de momento las usuarias verán un estado "Próximamente".

## What Changes

- Nueva pantalla de **creación de usuario** (`/welcome`): pide nombre y sexo con dos escenas SVG animadas (hombre / mujer). Cada escena está en grises hasta que se pulsa; al seleccionarla se colorea, saluda y dispara una animación ambiental (sol, pájaro…). Los SVG se crean **inline a mano**, animados con CSS, sin dependencias.
- El **store de perfil** gana `sex` (`'male' | 'female'`), persistido junto al nombre. "Usuario creado" = `sex` definido.
- **Gate de arranque nuevo**: si `sex` no está definido → `/welcome`. Después, el carrusel de onboarding actual se mantiene intacto detrás de la pantalla de creación. Un usuario existente que ya tenía datos define su sexo una vez y **conserva todo su historial** (sin migración ni namespacing: la identidad es única por dispositivo).
- **El sexo determina el contenido disponible**:
  - `male` → ve los 3 programas actuales (marcados como masculinos) y el modo libre, como hasta ahora.
  - `female` → estado **"Próximamente"** en training, programas y modo libre. Se captura el sexo pero el path femenino aún no tiene ejercicios.
- **Cambiar de usuario desde Perfil**: botón que reabre `/welcome` para redefinir nombre+sexo. Si se cambia de `male` a `female` con un programa activo, el programa se **desactiva** y se muestra "Próximamente"; el historial se conserva.
- Nuevas cadenas i18n (en + es) para la pantalla de creación, el estado "Próximamente" y "cambiar de usuario".

## Capabilities

### New Capabilities
- `user-identity`: creación y persistencia de la identidad del usuario (nombre + sexo), el gate de arranque asociado, y cómo el sexo condiciona el contenido disponible (programas masculinos vs. "Próximamente" femenino).

### Modified Capabilities
<!-- Ninguna: openspec/specs/ está vacío; no hay specs previos que modificar. -->

## Impact

- **Código nuevo:** `src/views/WelcomeView.vue` (pantalla creación + SVGs inline animados), ruta `/welcome` en `router/index.js`.
- **Código modificado:** `src/stores/profile.js` (campo `sex`), `src/router/index.js` (guard por `sex`), `src/stores/routines.js` (marcar programas como `male`), `src/views/TrainingView.vue`, `src/views/ProgramView.vue`, `src/views/FreeModeView.vue` (estado "Próximamente" cuando `sex==='female'`), `src/views/ProfileView.vue` ("cambiar de usuario"), `src/i18n/en.json` + `es.json`.
- **Datos/usuario:** sin migración. Los usuarios existentes pasan una vez por `/welcome` y conservan historial, programa y settings. La identidad es única (no hay multi-perfil).
- **Sin dependencias nuevas.** Los SVG y sus animaciones son inline + CSS.
