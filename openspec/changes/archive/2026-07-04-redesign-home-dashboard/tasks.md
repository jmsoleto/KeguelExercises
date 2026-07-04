# Tasks

> Change retroactivo: los cambios ya están implementados y verificados. Las tareas quedan marcadas para trazabilidad SDD.

## 1. Recomposición del estado dashboard (`TrainingView.vue`)
- [x] 1.1 Sustituir el header: wordmark + acceso a ajustes en una sola línea; mover el saludo al hero.
- [x] 1.2 Añadir sección de saludo (`training.hello` + titular con la fase/objetivo del día).
- [x] 1.3 Rehacer la tarjeta "Hoy" con plan activo: cabecera (programa + `routineLevel`), orbe de previsualización con `totalMinutes`, fila de métricas (reps · intensidad) con divisor, tip de fase, CTA primario y enlace a programa completo.
- [x] 1.4 Rehacer el estado sin plan con icono, texto y CTA "Elegir plan".
- [x] 1.5 Rediseñar la franja de "Modo libre" como tarjeta tintada distinta.
- [x] 1.6 Rediseñar el bloque de progreso: stats (total · semana · racha) en un panel con divisores; consistencia (`WeeklyChart`) y esfuerzo (`EffortChart`); historial en un panel con `divide-y` + control "Ver todo"; empty state conservado.
- [x] 1.7 Conservar el consejo de recuperación como nota de cierre.
- [x] 1.8 Preservar todos los bindings y computeds existentes (sin tocar `<script setup>`).

## 2. Sistema visual
- [x] 2.1 Fijar acento único (primary/teal) en toda la home.
- [x] 2.2 Documentar y aplicar la escala de forma (paneles 3xl, tiles 2xl, botones/chips pastilla) en la plantilla.

## 3. Movimiento accesible
- [x] 3.1 Añadir keyframes de entrada escalonada (`.anim-reveal`) y respiración del orbe (`.preview-orb`, `.preview-orb-glow`) en `<style scoped>`.
- [x] 3.2 Envolver ambas animaciones en `@media (prefers-reduced-motion: no-preference)`.

## 4. Corrección de paridad de tema (bug dark)
- [x] 4.1 Sustituir los tokens semánticos con opacidad que rompían los overrides de dark por tokens exactos (franja "Modo libre": `bg-secondary-container`, `text-on-surface`, `text-on-surface-variant`).
- [x] 4.2 Verificar render correcto en claro y oscuro; confirmar que `.dark .text-primary` computa el valor oscuro esperado.

## 5. Verificación
- [x] 5.1 `vite build` sin errores.
- [x] 5.2 Revisión visual en móvil (430px) en ambos modos: con plan, sin plan, progreso e historial.
- [x] 5.3 Confirmar que no se tocó el estado 2 (timer), la cuenta atrás ni el modo privacidad.
