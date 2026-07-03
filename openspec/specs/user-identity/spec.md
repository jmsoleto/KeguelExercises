# user-identity

## Purpose

Creación y persistencia de la identidad del usuario (nombre + sexo) en un dispositivo, el gate de arranque asociado, y cómo el sexo condiciona el contenido de ejercicios disponible.

## Requirements

### Requirement: Creación de identidad en el primer arranque
La aplicación MUST requerir que el usuario defina su identidad (nombre y sexo) antes de acceder al resto de la app cuando todavía no exista una identidad definida.

#### Scenario: Primer arranque sin identidad
- **WHEN** la app arranca y el perfil no tiene sexo definido
- **THEN** se muestra la pantalla de creación de usuario y no se permite navegar al entrenamiento hasta crear la identidad

#### Scenario: La creación exige nombre y sexo
- **WHEN** el usuario intenta confirmar la creación sin haber introducido un nombre o sin haber seleccionado un sexo
- **THEN** la acción de crear permanece deshabilitada hasta que ambos estén presentes

#### Scenario: Se conservan los datos de un usuario previo
- **WHEN** una instalación con historial previo arranca por primera vez tras introducir esta funcionalidad
- **THEN** se pide definir el sexo una única vez y el historial, el programa y los ajustes existentes se conservan

### Requirement: No volver a preguntar la identidad
La aplicación MUST omitir la pantalla de creación en arranques posteriores cuando la identidad ya esté definida.

#### Scenario: Reapertura con identidad definida
- **WHEN** la app arranca y el perfil ya tiene nombre y sexo
- **THEN** no se muestra la pantalla de creación y el arranque continúa con el flujo normal (onboarding si procede, y luego el entrenamiento)

### Requirement: Selección de sexo con escenas animadas
La pantalla de creación MUST presentar dos escenas (hombre y mujer) que comienzan en escala de grises y, al ser pulsadas, se colorean y reproducen una animación de saludo y una animación ambiental.

#### Scenario: Escena no seleccionada
- **WHEN** ninguna escena ha sido pulsada
- **THEN** ambas escenas se muestran en tonos grises y sin animación ambiental

#### Scenario: Selección de una escena
- **WHEN** el usuario pulsa una de las dos escenas
- **THEN** esa escena pasa a color, reproduce el saludo y su animación ambiental, queda marcada como seleccionada y la otra permanece en gris

#### Scenario: Cambio de selección
- **WHEN** el usuario pulsa la otra escena tras haber seleccionado una
- **THEN** la nueva escena queda seleccionada y coloreada y la anterior vuelve a gris

### Requirement: El sexo determina el contenido disponible
La aplicación MUST mostrar el contenido de ejercicios en función del sexo del usuario: los usuarios masculinos ven los programas y el modo libre; las usuarias femeninas ven un estado "Próximamente" en su lugar.

#### Scenario: Usuario masculino
- **WHEN** el usuario activo tiene sexo masculino
- **THEN** ve los programas disponibles y puede usar el modo libre y el entrenamiento con normalidad

#### Scenario: Usuaria femenina
- **WHEN** la usuaria activa tiene sexo femenino
- **THEN** las zonas de entrenamiento, programas y modo libre muestran un estado "Próximamente" en lugar del contenido de ejercicio

#### Scenario: Perfil e historial siempre accesibles
- **WHEN** el usuario activo es de cualquier sexo
- **THEN** puede acceder a su perfil y a su historial de progreso

### Requirement: Redefinir la identidad desde el perfil
La aplicación MUST permitir al usuario cambiar su nombre y su sexo desde el área de perfil, reutilizando la pantalla de creación.

#### Scenario: Abrir el cambio de usuario
- **WHEN** el usuario pulsa "cambiar de usuario" en el perfil
- **THEN** se abre la pantalla de creación para redefinir nombre y sexo

#### Scenario: Cambiar de masculino a femenino con programa activo
- **WHEN** el usuario tenía un programa activo y cambia su sexo a femenino
- **THEN** el programa activo se desactiva, se muestra el estado "Próximamente" y el historial de sesiones se conserva
