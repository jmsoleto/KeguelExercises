## 1. Modelo: identidad en el store de perfil

- [x] 1.1 En `stores/profile.js` añadir `sex` (`'male' | 'female' | null`), persistirlo y restaurarlo junto a `name` en `keguel_profile`
- [x] 1.2 Añadir `hasIdentity` (computed: `sex !== null`) y `setIdentity(name, sex)` con validación de nombre; exponerlos en el `return`
- [x] 1.3 Mantener compatibilidad: un `keguel_profile` antiguo (solo `name`) se carga con `sex = null`

## 2. Gate de arranque

- [x] 2.1 En `router/index.js`, redirigir a `/welcome` cuando `!profile.hasIdentity` (excepto si el destino ya es `welcome`), antes del gate de `keguel_onboarded`
- [x] 2.2 Registrar la ruta `/welcome` → `WelcomeView.vue`
- [x] 2.3 Añadir `welcome` a la lista de rutas sin BottomNav en `App.vue`

## 3. Pantalla de creación de usuario (`WelcomeView.vue`)

- [x] 3.1 Maquetar la vista: título, input de nombre, las dos escenas SVG lado a lado y botón "Empezar" deshabilitado hasta tener nombre + sexo
- [x] 3.2 Estado de selección reactivo (`selectedSex`) que aplica la clase `.selected` a la escena pulsada y la quita de la otra
- [x] 3.3 Acción de crear: `profile.setIdentity(name, sex)` y navegar al siguiente paso del gate (onboarding o training)
- [x] 3.4 Cadena de reutilización desde perfil: si ya hay identidad, precargar nombre/sexo actuales

## 4. Los dos SVG animados (inline, a mano)

- [x] 4.1 Escena **masculina**: SVG inline con grupos nombrados (cuerpo, brazo, ambiente), estilo plano faceless del prompt; estado idle en grises
- [x] 4.2 Escena **femenina**: SVG inline distinto (escena propia), mismo lenguaje visual; estado idle en grises
- [x] 4.3 CSS: `@keyframes wave` (brazo saluda) + animación ambiental por escena (p.ej. sol que sube / pájaro que cruza), disparadas por `.selected`
- [x] 4.4 Transición gris→color al seleccionar (fills a color o quitar `grayscale`)

## 5. El sexo determina el contenido

- [x] 5.1 Marcar los 3 programas de `stores/routines.js` con `sex: 'male'`
- [x] 5.2 Crear un estado/observación de "solo hay contenido para hombres" reutilizable (p.ej. `profile.sex === 'female'` → mostrar "Próximamente")
- [x] 5.3 `TrainingView.vue`: si `sex === 'female'`, mostrar estado "Próximamente" en lugar de la tarjeta de programa, el CTA de sesión y el modo libre
- [x] 5.4 `ProgramView.vue`: filtrar programas por sexo; si `female`, mostrar "Próximamente"
- [x] 5.5 `FreeModeView.vue`: si `female`, mostrar "Próximamente" (o bloquear la entrada al modo libre desde training)

## 6. Cambiar de usuario desde Perfil

- [x] 6.1 En `ProfileView.vue` añadir la acción "Cambiar de usuario" que navega a `/welcome`
- [x] 6.2 En `setIdentity`, si el sexo pasa a `female` y hay programa activo, llamar a `routines.resetProgram()` (conservando `keguel_history`)

## 7. i18n

- [x] 7.1 Añadir a `en.json` + `es.json` las cadenas de la pantalla de creación (título, "¿quién va a entrenar?", nombre, hombre, mujer, empezar)
- [x] 7.2 Añadir las cadenas del estado "Próximamente" (título + descripción)
- [x] 7.3 Añadir la cadena de "cambiar de usuario" en perfil
- [x] 7.4 Verificar paridad de claves en/es

## 8. Tests y verificación

- [x] 8.1 Test de `profile`: `setIdentity` persiste name+sex; `hasIdentity` refleja el estado; carga de perfil antiguo → `sex = null`
- [x] 8.2 Test de filtrado por sexo en `routines` (los programas son masculinos; contenido femenino vacío/"próximamente")
- [x] 8.3 Ejecutar la suite de tests y dejarla en verde
- [x] 8.4 `npm run build` limpio y verificación manual del flujo: primer arranque → /welcome → seleccionar escena (gris→color, saludo, ambiente) → crear → training; y "cambiar de usuario" a female → "Próximamente" con historial intacto
