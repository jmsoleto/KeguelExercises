## Why

La home (`TrainingView.vue`, estado dashboard) funcionaba, pero acumulaba deuda visual: mucho eyebrow en mayúsculas repetido, una escala de radios mezclada sin regla (`rounded-xl` 8px junto a `rounded-2xl` y `rounded-3xl`), un visual de relleno (caja 16:10 con un icono) y muchas tarjetas blancas casi idénticas apiladas. Para una app de un ejercicio médico dirigida a hombres y mujeres adultos, el tono debe ser **calmado y de confianza**, no de gimnasio.

Además, al preparar el rediseño se descubrió un **bug real de dark mode**: los overrides de tema oscuro en `src/assets/main.css` apuntan a clases exactas (p. ej. `.dark .bg-secondary-container`), de modo que cualquier uso de un token semántico con modificador de opacidad (`bg-secondary-container/60`) genera otra clase que el override no alcanza y cae al valor de modo claro. Eso deja secciones mal pintadas en oscuro.

El comportamiento de la home no cambia (mismo contenido: arranque de sesión, plan activo y progreso). Cambia la **presentación** y se añaden dos contratos observables que antes no estaban escritos: paridad de tema y respeto a `prefers-reduced-motion`.

## What Changes

**Recomposición de la home (`TrainingView.vue`, solo estado dashboard):**
- **Saludo personal** como entrada (`training.hello` + titular con la fase del día), en lugar del eyebrow en mayúsculas.
- **Tarjeta "Hoy"** rehecha: se elimina el visual de relleno y se sustituye por un **orbe que respira** mostrando los minutos de la sesión, que previsualiza el orbe real del timer (misma metáfora, animación motivada).
- **Métricas** (repeticiones · intensidad) en una fila con divisor fino, sin tarjetas anidadas.
- **CTA primario** de comenzar como pastilla; "Ver programa completo" pasa a enlace discreto.
- **Modo libre** como franja tintada (secondary-container) distinta del resto.
- **Progreso**: stats (total · semana · racha) en un panel único con divisores; consistencia, esfuerzo e historial con menos ruido de tarjetas; el historial en un solo panel con `divide-y` (un único divisor entre filas, no borde arriba+abajo por fila).

**Sistema visual:**
- **Acento único** (primary/teal) en toda la home.
- **Escala de forma documentada**: paneles `rounded-3xl` (24px), tiles `rounded-2xl` (16px), botones/chips/pastillas `rounded-full`.

**Movimiento (accesible):**
- Entrada escalonada de bienvenida y respiración del orbe, ambas detrás de `@media (prefers-reduced-motion: no-preference)`.

**Corrección de paridad de tema (bug):**
- Se dejan de usar tokens semánticos con opacidad donde eso rompía el override de dark; se usan tokens exactos (`bg-secondary-container`, `text-on-surface`, `text-on-surface-variant`) para que apliquen los overrides de `main.css` en oscuro.

## Capabilities

### Modified Capabilities
- `home-dashboard`: se formaliza el contrato de presentación del arranque de sesión, la paridad de tema claro/oscuro y el respeto a reduced-motion. El contenido y la navegación no cambian.

## Impact

- **Código:** `src/views/TrainingView.vue` (plantilla del estado dashboard + keyframes en `<style scoped>`). Sin cambios en stores, router, i18n ni tokens del design system.
- **Alcance:** solo el estado dashboard de la home. El estado 2 (timer con aura), la cuenta atrás y el modo privacidad no se tocan.
- **i18n:** se reutilizan claves existentes (`training.*`, `insights.*`, `free.*`); no se añaden ni eliminan claves.
- **Tests:** los tests de stores no se ven afectados (solo cambió plantilla). `vite build` pasa sin errores.
- **Datos/usuario:** sin migración. El wordmark "PelvicForce" y el estado `ComingSoon` (contenido femenino) se conservan.
- **Sin dependencias nuevas.**
