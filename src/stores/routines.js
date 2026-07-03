import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─────────────────────────────────────────────
// ESTRUCTURA DE UN PROGRAMA
//
// Cada programa tiene fases. Cada fase cubre N semanas
// y define el protocolo de ejercicio de esas semanas.
//
// phases[].sets: array de bloques dentro de una sesión
//   - type: 'slow' | 'fast' | 'reverse'
//   - reps
//   - contractSeconds  (tiempo de contracción / empuje)
//   - restSeconds      (tiempo de relajación completa)
//   - reverseSeconds   (solo en type 'reverse': duración del empuje hacia afuera)
//
// type 'slow'    → contracción lenta sostenida → relaja
// type 'fast'    → contracción explosiva corta  → relaja
// type 'reverse' → contrae → relaja → empuja hacia afuera → relaja
// ─────────────────────────────────────────────

export const PROGRAMS = [
  {
    id:          'control',
    name:        'Control Total',
    tagline:     'Domina el momento',
    icon:        'tune',
    colorClass:  'bg-tertiary-fixed text-on-tertiary-fixed',
    accentColor: '#214337',
    description: 'Desarrolla el control bidireccional del músculo BC para retrasar la eyaculación y ganar presencia en el momento.',
    duration:    '12 semanas',
    sessionsPerWeek: 5,
    benefit:     'Control eyaculatorio',
    phases: [
      {
        weeks:       [1, 2],
        name:        'Activación',
        description: 'Encuentra el músculo correcto sin compensar con glúteos ni abdomen. Paciencia — esta fase es la más importante.',
        tip:         'Si notas que aprietas el culo o aguantas la respiración, lo estás haciendo mal. Respira normal durante todo el ejercicio.',
        sets: [
          { type: 'slow', reps: 8,  contractSeconds: 3, restSeconds: 6 },
        ],
      },
      {
        weeks:       [3, 4],
        name:        'Conciencia',
        description: 'Aumenta la duración de la contracción y empieza a notar la diferencia entre tensión y relajación completa.',
        tip:         'La relajación es tan importante como la contracción. Asegúrate de soltar completamente entre reps.',
        sets: [
          { type: 'slow', reps: 10, contractSeconds: 5, restSeconds: 5 },
          { type: 'fast', reps: 10, contractSeconds: 1, restSeconds: 2 },
        ],
      },
      {
        weeks:       [5, 8],
        name:        'Control bidireccional',
        description: 'Introduces el Reverse Kegel — empujar hacia afuera activamente. Es la clave del control eyaculatorio real.',
        tip:         'El reverse Kegel es el antídoto. Cuando sientas que te acercas al punto de no retorno, empuja hacia afuera en lugar de apretar.',
        sets: [
          { type: 'slow',    reps: 10, contractSeconds: 5, restSeconds: 4 },
          { type: 'reverse', reps: 8,  contractSeconds: 3, restSeconds: 3, reverseSeconds: 5 },
        ],
      },
      {
        weeks:       [9, 12],
        name:        'Maestría',
        description: 'Combinas fuerza, velocidad y relajación activa en una sola sesión. El músculo ya tiene memoria.',
        tip:         'En esta fase puedes empezar a practicar el control en situaciones reales. El músculo ya responde con automatismo.',
        sets: [
          { type: 'slow',    reps: 12, contractSeconds: 6, restSeconds: 4 },
          { type: 'fast',    reps: 15, contractSeconds: 1, restSeconds: 1 },
          { type: 'reverse', reps: 10, contractSeconds: 3, restSeconds: 3, reverseSeconds: 6 },
        ],
      },
    ],
  },

  {
    id:          'erection',
    name:        'Erección Plena',
    tagline:     'Flujo y firmeza',
    icon:        'favorite',
    colorClass:  'bg-primary-fixed text-on-primary-fixed',
    accentColor: '#114349',
    description: 'Contracciones sostenidas para mejorar el flujo sanguíneo y el bloqueo venoso. Efecto visible en 6-8 semanas.',
    duration:    '12 semanas',
    sessionsPerWeek: 5,
    benefit:     'Función eréctil',
    phases: [
      {
        weeks:       [1, 2],
        name:        'Base vascular',
        description: 'Contracciones moderadas para comenzar a activar la circulación pélvica sin sobrecargar.',
        tip:         'Imagina que intentas cortar el flujo de orina a la mitad. Eso es exactamente el músculo que necesitas.',
        sets: [
          { type: 'slow', reps: 10, contractSeconds: 5, restSeconds: 5 },
        ],
      },
      {
        weeks:       [3, 4],
        name:        'Resistencia',
        description: 'Aumentamos la duración de las contracciones. El músculo aprende a mantener presión sostenida.',
        tip:         'Mantén el nivel máximo de contracción durante todo el hold. Es fácil bajar la intensidad a mitad sin darte cuenta.',
        sets: [
          { type: 'slow', reps: 12, contractSeconds: 8, restSeconds: 4 },
        ],
      },
      {
        weeks:       [5, 8],
        name:        'Volumen',
        description: 'Más repeticiones y mayor duración. El tejido eréctil empieza a responder con mayor consistencia.',
        tip:         'Combina esta rutina con 10 minutos de caminata diaria. El ejercicio aeróbico potencia los beneficios vasculares.',
        sets: [
          { type: 'slow', reps: 15, contractSeconds: 10, restSeconds: 5 },
          { type: 'fast', reps: 10, contractSeconds: 1,  restSeconds: 2 },
        ],
      },
      {
        weeks:       [9, 12],
        name:        'Consolidación',
        description: 'Sesiones de alto volumen que consolidan la mejora vascular y muscular conseguida.',
        tip:         'En esta fase los resultados suelen ser más notorios. Mantén la consistencia aunque ya notes mejora.',
        sets: [
          { type: 'slow', reps: 20, contractSeconds: 10, restSeconds: 5 },
          { type: 'fast', reps: 15, contractSeconds: 1,  restSeconds: 1 },
        ],
      },
    ],
  },

  {
    id:          'intensity',
    name:        'Máxima Intensidad',
    tagline:     'Potencia explosiva',
    icon:        'bolt',
    colorClass:  'bg-secondary-container text-on-secondary-container',
    accentColor: '#48626e',
    description: 'Trabajo de fibras rápidas (fast-twitch) para aumentar la intensidad y duración del orgasmo. El más exigente.',
    duration:    '12 semanas',
    sessionsPerWeek: 5,
    benefit:     'Intensidad del orgasmo',
    phases: [
      {
        weeks:       [1, 2],
        name:        'Explosividad base',
        description: 'Contracciones rápidas máximas. El objetivo es velocidad y potencia, no duración.',
        tip:         'Cada contracción tiene que ser al 100% de intensidad. Diez reps de calidad valen más que veinte a medias.',
        sets: [
          { type: 'slow', reps: 8,  contractSeconds: 5, restSeconds: 5 },
          { type: 'fast', reps: 10, contractSeconds: 1, restSeconds: 2 },
        ],
      },
      {
        weeks:       [3, 4],
        name:        'Potencia',
        description: 'Aumentamos el volumen de contracciones rápidas. El músculo BC empieza a desarrollar potencia real.',
        tip:         'Descansa 60 segundos entre bloques. Este plan es el más intenso — respeta bien los descansos entre sesiones para que el músculo se recupere.',
        sets: [
          { type: 'slow', reps: 10, contractSeconds: 5, restSeconds: 4 },
          { type: 'fast', reps: 20, contractSeconds: 1, restSeconds: 1 },
        ],
      },
      {
        weeks:       [5, 8],
        name:        'Pliométrico',
        description: 'Combinación de holds largos seguidos de explosiones rápidas. Trabaja ambos tipos de fibra musculares.',
        tip:         'La secuencia slow → fast en la misma sesión es el secreto. El hold previo pre-fatiga el músculo y amplifica el estímulo de las rápidas.',
        sets: [
          { type: 'slow', reps: 12, contractSeconds: 8, restSeconds: 4 },
          { type: 'fast', reps: 25, contractSeconds: 1, restSeconds: 1 },
        ],
      },
      {
        weeks:       [9, 12],
        name:        'Pico',
        description: 'Volumen máximo. El músculo está completamente desarrollado y entrenado para responder con máxima potencia.',
        tip:         'En esta fase puedes añadir una tercera sesión semanal opcional si el músculo ya no está cargado al día siguiente.',
        sets: [
          { type: 'slow', reps: 15, contractSeconds: 10, restSeconds: 4 },
          { type: 'fast', reps: 30, contractSeconds: 1,  restSeconds: 1 },
        ],
      },
    ],
  },
]

// type de ejercicio → clave de etiqueta i18n (free.types.*), compartida con el modo libre
const LABEL_KEY = { slow: 'long', fast: 'short', reverse: 'push' }

// ─────────────────────────────────────────────

export const useRoutinesStore = defineStore('routines', () => {

  // Programa seleccionado por el usuario
  // Filtramos el string "null" que puede quedar de un reset mal hecho
  const _storedProgram = localStorage.getItem('keguel_program')
  const selectedProgramId = ref((_storedProgram && _storedProgram !== 'null') ? _storedProgram : null)

  // Semana actual dentro del programa (1-12)
  const currentWeek = ref(Number(localStorage.getItem('keguel_week')) || 1)

  const selectedProgram = computed(() =>
    PROGRAMS.find(p => p.id === selectedProgramId.value) ?? null
  )

  // Fase activa según la semana actual
  const activePhase = computed(() => {
    if (!selectedProgram.value) return null
    return selectedProgram.value.phases.find(phase => {
      const [from, to] = phase.weeks
      return currentWeek.value >= from && currentWeek.value <= to
    }) ?? selectedProgram.value.phases.at(-1)
  })

  // Primer set de la fase activa (para resúmenes rápidos de la tarjeta)
  const activeSet = computed(() => activePhase.value?.sets[0] ?? null)

  // Nombre de la sesión guiada actual
  const activeSessionName = computed(() =>
    selectedProgram.value ? `${selectedProgram.value.name} · Semana ${currentWeek.value}` : ''
  )

  // Todos los sets de la fase activa como bloques encadenables por el timer,
  // igual que el modo libre. La sesión guiada entrena la fase completa.
  const activePhaseBlocks = computed(() => {
    const phase = activePhase.value
    if (!phase) return []
    return phase.sets.map(set => ({
      type:            set.type,
      reps:            set.reps,
      contractSeconds: set.contractSeconds,
      restSeconds:     set.restSeconds,
      reverseSeconds:  set.reverseSeconds ?? 0,
      labelKey:        LABEL_KEY[set.type],
    }))
  })

  // Para el store de sesión — configuración compatible con el timer (primer set)
  const activeRoutineConfig = computed(() => {
    const set = activeSet.value
    if (!set) return null
    return {
      name:            activeSessionName.value,
      reps:            set.reps,
      contractSeconds: set.contractSeconds,
      restSeconds:     set.restSeconds,
      reverseSeconds:  set.reverseSeconds ?? 0,
      type:            set.type,
    }
  })

  // Sesiones acumuladas en la semana actual del plan (independiente del calendario)
  const planWeekSessions = ref(Number(localStorage.getItem('keguel_plan_week_sessions')) || 0)

  // Sesiones de entrenamiento necesarias para completar una semana del plan
  const MIN_SESSIONS_TO_ADVANCE = 5

  function selectProgram(id) {
    selectedProgramId.value = id
    currentWeek.value       = 1
    planWeekSessions.value  = 0
    localStorage.setItem('keguel_program', id)
    localStorage.setItem('keguel_week', '1')
    localStorage.setItem('keguel_plan_week_sessions', '0')
  }

  function resetProgram() {
    selectedProgramId.value = null
    currentWeek.value       = 1
    planWeekSessions.value  = 0
    localStorage.removeItem('keguel_program')
    localStorage.setItem('keguel_week', '1')
    localStorage.removeItem('keguel_plan_week_sessions')
  }

  function advanceWeek() {
    if (currentWeek.value < 12) {
      currentWeek.value++
      planWeekSessions.value = 0
      localStorage.setItem('keguel_week', String(currentWeek.value))
      localStorage.setItem('keguel_plan_week_sessions', '0')
    }
  }

  // Avance manual: siempre disponible si no se ha llegado a la semana 12
  function tryAdvanceWeek() {
    if (currentWeek.value < 12) {
      advanceWeek()
      return { advanced: true }
    }
    return { advanced: false }
  }

  // Registra una sesión completada y avanza automáticamente si se alcanza el mínimo
  function incrementPlanSession() {
    if (!selectedProgramId.value) return { advanced: false }
    planWeekSessions.value++
    localStorage.setItem('keguel_plan_week_sessions', String(planWeekSessions.value))
    if (planWeekSessions.value >= MIN_SESSIONS_TO_ADVANCE && currentWeek.value < 12) {
      advanceWeek()
      return { advanced: true }
    }
    return { advanced: false }
  }

  return {
    PROGRAMS,
    selectedProgramId, selectedProgram, currentWeek,
    activePhase, activeSet, activePhaseBlocks, activeSessionName, activeRoutineConfig,
    planWeekSessions, MIN_SESSIONS_TO_ADVANCE,
    selectProgram, resetProgram, advanceWeek, tryAdvanceWeek, incrementPlanSession,
  }
})
