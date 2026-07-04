# home-dashboard

## Purpose

La pantalla de inicio (`/training`) es el único dashboard de la app: concentra el arranque de la sesión, la información del plan activo y el progreso del usuario (estadísticas e historial), sin barra de navegación inferior ni pantalla de progreso separada.

## Requirements

### Requirement: La home es el único dashboard
El sistema MUST concentrar en la pantalla de inicio (`/training`, estado dashboard) el arranque de la sesión, la información del plan activo y el progreso del usuario. El sistema MUST NOT ofrecer una pantalla de progreso separada ni una ruta `/insights`.

#### Scenario: No existe pantalla de progreso independiente
- **WHEN** el usuario navega por la aplicación
- **THEN** no encuentra una ruta ni pantalla dedicada de progreso; todo el progreso se consulta desde la home

#### Scenario: El progreso vive en la home
- **WHEN** el usuario abre la home en estado dashboard
- **THEN** ve, además del plan y el CTA de comenzar, un bloque de progreso con sus estadísticas y el historial de sesiones

### Requirement: Progreso en la home
La home MUST mostrar un bloque de progreso que incluya las estadísticas globales (total de sesiones, sesiones de esta semana y racha actual), la consistencia semanal, la tendencia de esfuerzo y el historial de sesiones.

#### Scenario: Estadísticas globales
- **WHEN** el usuario tiene sesiones registradas y ve el bloque de progreso
- **THEN** el sistema muestra el total de sesiones, cuántas ha hecho esta semana y su racha actual

#### Scenario: Historial colapsado por defecto
- **WHEN** el usuario tiene más sesiones en el historial que el límite mostrado por defecto
- **THEN** la home muestra sólo las sesiones más recientes y ofrece un control "Ver todo" que despliega el resto in-situ, sin navegar a otra pantalla

#### Scenario: Sin sesiones todavía
- **WHEN** el usuario aún no ha completado ninguna sesión
- **THEN** el bloque de historial muestra un estado vacío en lugar de una lista

#### Scenario: Sin duplicar la consistencia
- **WHEN** el usuario ve el bloque de progreso
- **THEN** la consistencia semanal se presenta una sola vez (gráfico de consistencia), sin un segundo gráfico de actividad semanal equivalente

### Requirement: Navegación sin barra inferior
El sistema MUST NOT presentar una barra de navegación inferior (bottom nav) en ninguna pantalla. El acceso al plan MUST realizarse desde las tarjetas de la home y el acceso al progreso MUST resolverse dentro de la propia home.

#### Scenario: Ninguna pantalla muestra bottom nav
- **WHEN** el usuario visita cualquier pantalla de la aplicación (home, planes, detalle de plan, modo libre, resumen, perfil)
- **THEN** ninguna muestra una barra de navegación inferior

#### Scenario: Acceso al plan desde la home
- **WHEN** el usuario quiere ver o elegir un plan
- **THEN** accede a la lista de planes desde las tarjetas de la home, no desde una barra de navegación

#### Scenario: Retorno desde la lista de planes
- **WHEN** el usuario está en la lista de planes
- **THEN** dispone de un control de retorno visible junto al título que vuelve a la pantalla anterior, o a la home si entró directamente

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
