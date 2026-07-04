# Design

## Lectura de diseño

Home de una app móvil de salud (Vue 3 + Capacitor) para adultos, hombres y mujeres, que practican un ejercicio médico de suelo pélvico. Lenguaje **calmado y de confianza** (wellness-clínico), no de gimnasio. Se reutiliza el design system Material 3 existente (Aeon Health, acento teal) sin romperlo.

Modo: **redesign - preservar**. IA, stores, i18n, timer y tokens de color son sólidos. Evolución dirigida del bloque dashboard, no un overhaul.

Diales aplicados: variance 5 (claridad ante todo), motion 4 (respiración sutil), density 3 (aire generoso para bajar la ansiedad de un tema íntimo).

## Decisiones

### Acento único + escala de forma documentada
- Un solo acento en toda la home: `primary` (teal del design system).
- Escala de radios fijada y documentada en la plantilla:
  - Paneles grandes: `rounded-3xl` (24px)
  - Tiles / superficies: `rounded-2xl` (16px)
  - Botones / chips / pastillas: `rounded-full`
- Motivo: la home original mezclaba `rounded-xl` (8px), `rounded-2xl` y `rounded-3xl` sin regla.

### El orbe como previsualización, no decoración
Se elimina el visual de relleno (caja 16:10 con un icono) y se sustituye por un orbe que respira mostrando los minutos de la sesión. No es adorno: replica la metáfora del orbe real del timer (estado 2), así la home previsualiza la experiencia de la sesión. La animación queda justificada (previsualización + jerarquía).

### Métricas sin tarjetas anidadas
Repeticiones e intensidad se muestran en una fila con divisor fino sobre una superficie tenue, en lugar de dos tarjetas anidadas dentro de la tarjeta "Hoy". Menos cajas, más aire.

### Historial con un único divisor por fila
El historial va en un solo panel con `divide-y` (un divisor entre filas), no `border-t` + `border-b` en cada fila. Evita el patrón de "hoja de especificaciones" pesada.

## Trampa descubierta: opacidad sobre tokens semánticos rompe el dark mode

Los overrides de modo oscuro viven en `src/assets/main.css` y apuntan a **clases exactas**:

```css
.dark .bg-secondary-container { background-color: #304a55 !important; }
```

Al usar un token semántico con modificador de opacidad de Tailwind, se genera **otra clase** (`bg-secondary-container/60`) que el override por clase exacta no alcanza. Resultado: en oscuro cae al valor de modo claro y la sección se pinta mal (la franja "Modo libre" salía como un bloque gris claro).

```
  Clase usada                    ¿Coincide con override .dark?   Resultado en dark
  ─────────────────────────────  ──────────────────────────────  ──────────────────
  bg-secondary-container         sí (clase exacta)               correcto (#304a55)
  bg-secondary-container/60      no (clase distinta)             cae a valor light  ✗
```

**Regla adoptada:** para superficies con override de dark, usar el token semántico **exacto** (sin opacidad). Donde se necesite matiz, preferir tokens que ya tienen su propio override (`surface-container-*`) o colores de texto con override (`text-on-surface`, `text-on-surface-variant`). Verificado: `.dark .text-primary` computa `#a1ced6` sobre `#111d23`.

## Movimiento

- Entrada escalonada de secciones (`--i` como índice, `animation-delay: calc(var(--i) * 65ms)`) y respiración del orbe/glow.
- Ambas detrás de `@media (prefers-reduced-motion: no-preference)`; bajo reducción, todo queda estático e inmediato.
- Solo `transform`/`opacity`. Sin listeners de scroll.

## Fuera de alcance
- Estado 2 (timer con aura), cuenta atrás y modo privacidad: intactos.
- Wordmark "PelvicForce" y estado `ComingSoon` (contenido femenino): sin cambios.
- Otras pantallas (perfil, programa, modo libre): sin cambios.
