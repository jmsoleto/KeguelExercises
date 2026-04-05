import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─────────────────────────────────────────────
// Fases del timer:
//
// 'ready'    → cuenta atrás inicial (5s)
// 'prepare'  → posición corporal para compound exercises (bridge_kegel, squat_kegel)
// 'contract' → contracción (long_holds, quick_flicks, elevator ascenso, isometric, bridge, squat)
// 'descend'  → descenso gradual del elevador (elevator)
// 'reverse'  → empuje hacia afuera (reverse_kegel)
// 'rest'     → relajación completa
//
// Máquina de estados por tipo de ejercicio:
//
// long_holds / quick_flicks:
//   ready → contract → rest → next rep
//
// reverse_kegel:
//   ready → reverse → rest → next rep
//
// elevator:
//   ready → contract(ascenso 4 niveles) → descend(descenso 4 niveles) → rest → next rep
//
// isometric_hold:
//   ready → contract(4 niveles) → rest → next rep
//
// bridge_kegel / squat_kegel:
//   ready → prepare → contract → rest → next rep
// ─────────────────────────────────────────────

export const useSessionStore = defineStore('session', () => {
  const isActive      = ref(false)
  const isPaused      = ref(false)
  const phase         = ref('rest')
  const currentRep    = ref(0)
  const elapsedTime   = ref(0)
  const phaseTimeLeft = ref(0)

  const lastSession   = ref(null)
  const history       = ref(JSON.parse(localStorage.getItem('keguel_history') || '[]'))
  const activeRoutine = ref(null)

  // Cola de ejercicios para sesión multi-ejercicio
  const exerciseQueue         = ref([])
  const currentExerciseIndex  = ref(0)

  let timer = null

  // ─── Computed desde la rutina activa ──────────
  const totalReps        = computed(() => activeRoutine.value?.reps            ?? 10)
  const contractDuration = computed(() => activeRoutine.value?.contractSeconds ?? 5)
  const restDuration     = computed(() => activeRoutine.value?.restSeconds     ?? 5)
  const reverseDuration  = computed(() => activeRoutine.value?.reverseSeconds  ?? 0)
  const levels           = computed(() => activeRoutine.value?.levels          ?? 0)
  const prepareDuration  = computed(() => activeRoutine.value?.prepareSeconds  ?? 0)
  const exerciseType     = computed(() => activeRoutine.value?.type            ?? 'long_holds')

  const hasReverse       = computed(() => reverseDuration.value > 0)
  const hasLevels        = computed(() => levels.value > 0)
  const hasPrepare       = computed(() => prepareDuration.value > 0)
  const hasDescend       = computed(() => exerciseType.value === 'elevator')

  // Duración del descenso para elevator (igual que contracción)
  const descendDuration  = computed(() => hasDescend.value ? contractDuration.value : 0)

  // Duración de una rep según el tipo
  const repDuration = computed(() => {
    let d = contractDuration.value + restDuration.value
    if (hasReverse.value) d = reverseDuration.value + restDuration.value
    if (hasDescend.value) d += descendDuration.value
    return d
  })

  const totalDuration = computed(() => {
    let d = totalReps.value * repDuration.value
    if (hasPrepare.value) d += prepareDuration.value
    return d
  })

  const progress = computed(() =>
    totalDuration.value > 0 ? elapsedTime.value / totalDuration.value : 0
  )

  // Nivel actual (1-4) para elevator/isometric_hold
  const currentLevel = computed(() => {
    if (!hasLevels.value) return null
    if (phase.value !== 'contract' && phase.value !== 'descend') return null

    const totalPhaseTime = phase.value === 'descend'
      ? descendDuration.value
      : contractDuration.value
    const elapsed = totalPhaseTime - phaseTimeLeft.value
    const perLevel = totalPhaseTime / levels.value

    if (phase.value === 'descend') {
      // Descending: 4 → 3 → 2 → 1
      return Math.max(1, levels.value - Math.floor(elapsed / perLevel))
    }
    // Ascending: 1 → 2 → 3 → 4
    return Math.min(levels.value, Math.floor(elapsed / perLevel) + 1)
  })

  // Progreso multi-ejercicio
  const totalExercisesInQueue = computed(() => exerciseQueue.value.length)
  const sessionProgress = computed(() =>
    totalExercisesInQueue.value > 0
      ? currentExerciseIndex.value / totalExercisesInQueue.value
      : 0
  )
  const hasMoreExercises = computed(() =>
    currentExerciseIndex.value < exerciseQueue.value.length - 1
  )

  // ─── API pública ──────────────────────────────
  const READY_DURATION = 5

  function startSession(routine, queue = []) {
    activeRoutine.value = routine
    exerciseQueue.value = queue.length > 0 ? queue : [routine]
    currentExerciseIndex.value = queue.length > 0
      ? queue.findIndex(r => r === routine || (r.exerciseId === routine.exerciseId && r.reps === routine.reps))
      : 0
    if (currentExerciseIndex.value < 0) currentExerciseIndex.value = 0

    _beginExercise()
  }

  function _beginExercise() {
    isActive.value      = true
    isPaused.value      = false
    currentRep.value    = 0
    elapsedTime.value   = 0
    phase.value         = 'ready'
    phaseTimeLeft.value = READY_DURATION
    _prepareComplete.value = false
    _afterReverse.value = false
    _tick()
  }

  function pauseSession()  { isPaused.value = true;  clearInterval(timer) }
  function resumeSession() { isPaused.value = false; _tick() }

  function stopSession() {
    clearInterval(timer)
    isActive.value = false
    isPaused.value = false
    phase.value    = 'rest'
  }

  function completeSession(effortRating = null) {
    clearInterval(timer)
    const session = {
      id:         Date.now(),
      date:       new Date().toISOString(),
      routine:    activeRoutine.value?.name ?? 'Sesión libre',
      type:       exerciseType.value,
      exerciseId: activeRoutine.value?.exerciseId ?? exerciseType.value,
      duration:   elapsedTime.value,
      reps:       currentRep.value,
      totalReps:  totalReps.value,
      accuracy:   Math.round((currentRep.value / totalReps.value) * 100),
      effort:     effortRating,
    }
    lastSession.value = session
    history.value.unshift(session)
    localStorage.setItem('keguel_history', JSON.stringify(history.value))
    isActive.value = false
  }

  // Avanzar al siguiente ejercicio en la cola
  function advanceToNextExercise() {
    if (!hasMoreExercises.value) return false
    currentExerciseIndex.value++
    activeRoutine.value = exerciseQueue.value[currentExerciseIndex.value]
    _beginExercise()
    return true
  }

  // ─── Máquina de estados ───────────────────────
  const _prepareComplete = ref(false)
  const _afterReverse    = ref(false)

  function _nextPhase() {
    // ready → primera fase real
    if (phase.value === 'ready') {
      // Compound exercises: prepare primero (solo una vez)
      if (hasPrepare.value && !_prepareComplete.value) {
        phase.value         = 'prepare'
        phaseTimeLeft.value = prepareDuration.value
        return
      }
      _startFirstPhaseOfRep()
      return
    }

    // prepare → primera contracción
    if (phase.value === 'prepare') {
      _prepareComplete.value = true
      _startFirstPhaseOfRep()
      return
    }

    // contract → depende del tipo
    if (phase.value === 'contract') {
      if (hasDescend.value) {
        // elevator: contract → descend
        phase.value         = 'descend'
        phaseTimeLeft.value = descendDuration.value
      } else {
        // Todos los demás: contract → rest
        phase.value         = 'rest'
        phaseTimeLeft.value = restDuration.value
      }
      return
    }

    // descend → rest (elevator)
    if (phase.value === 'descend') {
      phase.value         = 'rest'
      phaseTimeLeft.value = restDuration.value
      return
    }

    // reverse → rest (reverse_kegel)
    if (phase.value === 'reverse') {
      phase.value         = 'rest'
      phaseTimeLeft.value = restDuration.value
      _afterReverse.value = true
      return
    }

    // rest → next rep
    if (phase.value === 'rest') {
      _advanceRep()
      return
    }
  }

  function _startFirstPhaseOfRep() {
    if (hasReverse.value) {
      // reverse_kegel: la fase principal es reverse (push out)
      phase.value         = 'reverse'
      phaseTimeLeft.value = reverseDuration.value
    } else {
      phase.value         = 'contract'
      phaseTimeLeft.value = contractDuration.value
    }
  }

  function _advanceRep() {
    currentRep.value++
    if (currentRep.value >= totalReps.value) {
      completeSession()
      return
    }
    _afterReverse.value = false
    _startFirstPhaseOfRep()
  }

  function _tick() {
    clearInterval(timer)
    timer = setInterval(() => {
      if (isPaused.value || !isActive.value) return
      if (phase.value !== 'ready') elapsedTime.value++
      phaseTimeLeft.value--
      if (phaseTimeLeft.value <= 0) _nextPhase()
    }, 1000)
  }

  // ─── Actividad semanal para gráficas ──────────
  const weekActivity = computed(() => {
    const days   = Array(7).fill(false)
    const now    = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    history.value.forEach(s => {
      const d    = new Date(s.date)
      const diff = Math.floor((d - monday) / 86400000)
      if (diff >= 0 && diff < 7) days[diff] = true
    })
    return days
  })

  return {
    isActive, isPaused, phase, currentRep, elapsedTime, phaseTimeLeft,
    lastSession, history, activeRoutine,
    totalReps, contractDuration, restDuration, reverseDuration,
    hasReverse, exerciseType, totalDuration, progress,
    levels, prepareDuration, hasLevels, hasPrepare, hasDescend,
    descendDuration, currentLevel,
    exerciseQueue, currentExerciseIndex, totalExercisesInQueue,
    sessionProgress, hasMoreExercises,
    weekActivity,
    startSession, pauseSession, resumeSession, stopSession,
    completeSession, advanceToNextExercise,
  }
})
