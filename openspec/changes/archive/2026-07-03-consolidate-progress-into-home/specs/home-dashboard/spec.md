## ADDED Requirements

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
