## ADDED Requirements

### Requirement: Arranque de sesión como foco de la home
La home MUST presentar el arranque de la sesión como su foco principal en el estado dashboard: un saludo personalizado, la fase u objetivo del día, una tarjeta "Hoy" con la previsualización de la sesión (duración estimada y parámetros clave) y un CTA primario para comenzar. La tarjeta "Hoy" MUST distinguir el estado con plan activo del estado sin plan.

#### Scenario: Saludo personalizado y objetivo del día
- **WHEN** el usuario abre la home en estado dashboard con un plan activo
- **THEN** ve un saludo con su nombre y el nombre de la fase (u objetivo) del día como titular

#### Scenario: Previsualización de la sesión
- **WHEN** el usuario tiene un plan activo y ve la tarjeta "Hoy"
- **THEN** el sistema muestra la duración estimada de la sesión y sus parámetros clave (repeticiones e intensidad), junto a un CTA primario para comenzar y un acceso secundario al programa completo

#### Scenario: Sin plan activo
- **WHEN** el usuario no tiene ningún plan seleccionado
- **THEN** la tarjeta "Hoy" muestra un estado sin plan con un CTA para elegir plan, en lugar de la previsualización de sesión

### Requirement: Paridad de tema claro/oscuro
La home MUST renderizarse correctamente tanto en modo claro como en oscuro, manteniendo un único tema por página (ninguna sección se invierte). Los colores MUST resolverse mediante los tokens semánticos del design system de forma que los overrides de modo oscuro apliquen; el sistema MUST NOT usar tokens semánticos con modificadores de opacidad cuando eso impida que apliquen los overrides de dark definidos por clase exacta.

#### Scenario: Todas las secciones respetan el tema activo
- **WHEN** el usuario abre la home en modo oscuro
- **THEN** todas las secciones (saludo, tarjeta "Hoy", modo libre, progreso, historial y consejo) usan la paleta oscura, sin bloques que caigan a colores de modo claro

#### Scenario: La franja de modo libre respeta el tema
- **WHEN** el usuario ve la franja de "Modo libre" en modo oscuro
- **THEN** se pinta con el color de superficie oscuro correspondiente y su texto mantiene contraste legible, no como un bloque de color claro

### Requirement: Movimiento con respeto a las preferencias de reducción
Las animaciones de la home (entrada escalonada de las secciones y la respiración del orbe de previsualización) MUST deshabilitarse cuando el usuario tiene activada la preferencia `prefers-reduced-motion`. Las animaciones MUST estar motivadas (bienvenida/jerarquía y previsualización de la sesión) y no bloquear la lectura del contenido.

#### Scenario: El usuario prefiere movimiento reducido
- **WHEN** el usuario tiene `prefers-reduced-motion: reduce` y abre la home
- **THEN** las secciones aparecen sin animación de entrada y el orbe de previsualización no respira; el contenido es visible y estable de inmediato

#### Scenario: Movimiento por defecto
- **WHEN** el usuario no expresa preferencia de reducción de movimiento y abre la home
- **THEN** las secciones entran con una animación escalonada suave y el orbe de previsualización respira de forma continua
