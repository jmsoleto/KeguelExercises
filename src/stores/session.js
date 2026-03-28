import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Fases posibles del timer:
// 'contract' → contracción lenta/explosiva
// 'rest'     → relajación completa
// 'reverse'  → reverse Kegel (empujar hacia afuera activamente)

export const useSessionStore = defineStore('session', () => {
  const isActive      = ref(false)
  const isPaused      = ref(false)
  const phase         = ref('rest')      // 'contract' | 'rest' | 'reverse'
  const currentRep    = ref(0)
  const elapsedTime   = ref(0)
  const phaseTimeLeft = ref(0)

  const lastSession   = ref(null)
  const history       = ref(JSON.parse(localStorage.getItem('keguel_history') || '[]'))
  const activeRoutine = ref(null)        // config inyectada desde routines store

  let timer = null

  // ─── Computed desde la rutina activa ──────────
  const totalReps        = computed(() => activeRoutine.value?.reps            ?? 10)
  const contractDuration = computed(() => activeRoutine.value?.contractSeconds ?? 5)
  const restDuration     = computed(() => activeRoutine.value?.restSeconds     ?? 5)
  const reverseDuration  = computed(() => activeRoutine.value?.reverseSeconds  ?? 0)
  const hasReverse       = computed(() => reverseDuration.value > 0)
  const exerciseType     = computed(() => activeRoutine.value?.type            ?? 'slow')

  // Duración total de una rep según si tiene reverse o no
  const repDuration = computed(() =>
    contractDuration.value + restDuration.value +
    (hasReverse.value ? reverseDuration.value + restDuration.value : 0)
  )
  const totalDuration = computed(() => totalReps.value * repDuration.value)
  const progress      = computed(() =>
    totalDuration.value > 0 ? elapsedTime.value / totalDuration.value : 0
  )

  // ─── API pública ──────────────────────────────
  const READY_DURATION = 5

  function startSession(routine) {
    activeRoutine.value = routine
    isActive.value      = true
    isPaused.value      = false
    currentRep.value    = 0
    elapsedTime.value   = 0
    phase.value         = 'ready'
    phaseTimeLeft.value = READY_DURATION
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

  // ─── Máquina de estados de fases ─────────────
  //
  //  Ciclo sin reverse:  contract → rest → [siguiente rep]
  //  Ciclo con reverse:  contract → rest → reverse → rest → [siguiente rep]
  //
  function _nextPhase() {
    if (phase.value === 'ready') {
      phase.value         = 'contract'
      phaseTimeLeft.value = contractDuration.value
      return
    }
    if (phase.value === 'contract') {
      phase.value         = 'rest'
      phaseTimeLeft.value = restDuration.value
    }
    else if (phase.value === 'rest') {
      if (hasReverse.value) {
        // Determinar si venimos de 'reverse' (es decir ya completamos el ciclo) o de 'contract'
        // Lo resolvemos con un flag interno
        if (_afterReverse.value) {
          _afterReverse.value = false
          _advanceRep()
        } else {
          phase.value         = 'reverse'
          phaseTimeLeft.value = reverseDuration.value
        }
      } else {
        _advanceRep()
      }
    }
    else if (phase.value === 'reverse') {
      _afterReverse.value = true
      phase.value         = 'rest'
      phaseTimeLeft.value = restDuration.value
    }
  }

  const _afterReverse = ref(false)

  function _advanceRep() {
    currentRep.value++
    if (currentRep.value >= totalReps.value) {
      completeSession()
      return
    }
    _afterReverse.value = false
    phase.value         = 'contract'
    phaseTimeLeft.value = contractDuration.value
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
    weekActivity,
    startSession, pauseSession, resumeSession, stopSession, completeSession,
  }
})
