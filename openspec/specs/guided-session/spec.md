# guided-session

## Purpose

Comportamiento de la sesión de entrenamiento guiada por un programa: cadencia semanal, avance de semana y encadenado de los sets de la fase activa.

## Requirements

### Requirement: Cadencia semanal coherente
El sistema MUST presentar una única cadencia semanal en toda la interfaz. El número de sesiones anunciado por un programa (`sessionsPerWeek`) MUST coincidir con el número de sesiones necesarias para avanzar de semana (`MIN_SESSIONS_TO_ADVANCE`), fijado en 5.

#### Scenario: La tarjeta de plan y el progreso coinciden
- **WHEN** el usuario ve la tarjeta de un programa y el indicador de progreso de la semana
- **THEN** ambos reflejan la misma cadencia de 5 sesiones por semana (p.ej. "5/semana" y "Día X/5")

#### Scenario: Los tips no contradicen la cadencia
- **WHEN** el usuario lee el tip de una fase de cualquier programa
- **THEN** ningún tip afirma una cadencia distinta de la declarada por el programa

### Requirement: Avance de semana por sesiones completadas
El sistema MUST avanzar automáticamente a la siguiente semana del plan cuando el usuario complete 5 sesiones guiadas en la semana actual, hasta la semana 12.

#### Scenario: Avance al alcanzar el mínimo
- **WHEN** el usuario completa su quinta sesión guiada de la semana y la semana actual es menor que 12
- **THEN** el sistema avanza a la semana siguiente y reinicia el contador de sesiones de la semana

#### Scenario: No se avanza más allá de la semana 12
- **WHEN** el usuario completa sesiones estando en la semana 12
- **THEN** el sistema no avanza de semana y conserva la semana 12

### Requirement: La sesión guiada entrena la fase completa
Al iniciar una sesión guiada por un programa, el sistema MUST entrenar todos los sets de la fase activa como una secuencia de bloques encadenados, con un descanso de transición entre bloques, del mismo modo que el modo libre.

#### Scenario: Fase con varios sets
- **WHEN** el usuario inicia una sesión guiada de una fase que define varios sets (p.ej. slow, fast y reverse)
- **THEN** el timer ejecuta cada set como un bloque, en orden, con un descanso de transición entre ellos, hasta completar todos

#### Scenario: Fase con un único set
- **WHEN** el usuario inicia una sesión guiada de una fase que define un solo set
- **THEN** el timer ejecuta ese único bloque y completa la sesión

#### Scenario: Identificación del bloque en curso
- **WHEN** una sesión guiada de varios bloques está en marcha
- **THEN** la interfaz indica qué ejercicio corresponde al bloque actual y su posición dentro de la secuencia

#### Scenario: Duración estimada incluye todos los bloques
- **WHEN** el usuario ve la duración estimada de una sesión guiada multi-set antes de empezar
- **THEN** la estimación suma la duración de todos los bloques y sus descansos de transición
