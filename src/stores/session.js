import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Descanso (segundos) intercalado entre cada cambio de ejercicio (bloques)
export const TRANSITION_REST = 10

// Fases posibles del timer:
// 'contract'   → contracción lenta/explosiva
// 'rest'       → relajación completa
// 'reverse'    → reverse Kegel (empujar hacia afuera activamente)
// 'transition' → descanso entre bloques (cambio de ejercicio)
//
// Una sesión está compuesta por uno o más BLOQUES. Cada bloque define
// un tipo de ejercicio con sus repeticiones y duraciones. Los programas
// usan un único bloque; el modo libre encadena varios (largas, cortas, empuje).

export const useSessionStore = defineStore('session', () => {
  const isActive      = ref(false)
  const isPaused      = ref(false)
  const phase         = ref('rest')      // 'contract' | 'rest' | 'reverse'
  const currentRep    = ref(0)           // rep dentro del bloque actual
  const elapsedTime   = ref(0)
  const phaseTimeLeft = ref(0)

  const lastSession   = ref(null)
  const history       = ref(JSON.parse(localStorage.getItem('keguel_history') || '[]'))

  // ─── Bloques de la sesión ─────────────────────
  const blocks            = ref([])      // [{ type, reps, contractSeconds, restSeconds, reverseSeconds, labelKey?, tanda?, tandaTotal? }]
  const currentBlockIndex = ref(0)
  const isFreeMode        = ref(false)
  const sessionName       = ref('')

  // Bloques preparados desde el modo libre, pendientes de arrancar en TrainingView
  const pendingFree       = ref(null)    // { blocks, name } | null

  let timer = null
  const _afterReverse = ref(false)

  // ─── Computed desde el bloque activo ──────────
  const currentBlock     = computed(() => blocks.value[currentBlockIndex.value] ?? null)
  const totalBlocks      = computed(() => blocks.value.length)
  const totalReps        = computed(() => currentBlock.value?.reps            ?? 10)
  const contractDuration = computed(() => currentBlock.value?.contractSeconds ?? 5)
  const restDuration     = computed(() => currentBlock.value?.restSeconds     ?? 5)
  const reverseDuration  = computed(() => currentBlock.value?.reverseSeconds  ?? 0)
  const hasReverse       = computed(() => reverseDuration.value > 0)
  const exerciseType     = computed(() => currentBlock.value?.type            ?? 'slow')

  // Duración de una rep del bloque actual (para barras de progreso)
  const repDuration = computed(() =>
    contractDuration.value + restDuration.value +
    (hasReverse.value ? reverseDuration.value + restDuration.value : 0)
  )

  // Duración total de toda la sesión (suma de bloques + descansos entre ellos)
  const totalDuration = computed(() => {
    const blocksSecs = blocks.value.reduce((sum, b) => {
      const rev = b.reverseSeconds ?? 0
      const rd  = b.contractSeconds + b.restSeconds + (rev > 0 ? rev + b.restSeconds : 0)
      return sum + b.reps * rd
    }, 0)
    const transitions = Math.max(0, blocks.value.length - 1) * TRANSITION_REST
    return blocksSecs + transitions
  })

  // Repeticiones totales de la sesión completa
  const grandTotalReps = computed(() =>
    blocks.value.reduce((sum, b) => sum + b.reps, 0)
  )

  const progress = computed(() =>
    totalDuration.value > 0 ? elapsedTime.value / totalDuration.value : 0
  )

  // Repeticiones completadas hasta ahora en toda la sesión
  const completedReps = computed(() =>
    blocks.value
      .slice(0, currentBlockIndex.value)
      .reduce((sum, b) => sum + b.reps, 0) + currentRep.value
  )

  // ─── API pública ──────────────────────────────

  // config: un objeto rutina (programa) o un array de bloques (modo libre)
  function startSession(config, { free = false, name = '' } = {}) {
    blocks.value            = Array.isArray(config) ? config : [config]
    currentBlockIndex.value = 0
    isFreeMode.value        = free
    sessionName.value       = name || config?.name || ''
    isActive.value          = true
    isPaused.value          = false
    currentRep.value        = 0
    elapsedTime.value       = 0
    _afterReverse.value     = false
    phase.value             = 'contract'
    phaseTimeLeft.value     = contractDuration.value
    _tick()
  }

  // Guarda los bloques del modo libre para que TrainingView arranque la sesión
  function prepareFreeSession(freeBlocks, name = '') {
    pendingFree.value = { blocks: freeBlocks, name }
  }
  function consumePendingFree() {
    const pf = pendingFree.value
    pendingFree.value = null
    return pf
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
      routine:    sessionName.value || 'Sesión libre',
      type:       isFreeMode.value ? 'free' : exerciseType.value,
      duration:   elapsedTime.value,
      reps:       completedReps.value,
      totalReps:  grandTotalReps.value,
      accuracy:   grandTotalReps.value > 0
        ? Math.round((completedReps.value / grandTotalReps.value) * 100)
        : 0,
      free:       isFreeMode.value,
      effort:     effortRating,
    }
    lastSession.value = session
    history.value.unshift(session)
    localStorage.setItem('keguel_history', JSON.stringify(history.value))
    isActive.value = false
  }

  // Registra el esfuerzo percibido sobre la sesión recién completada.
  // Actualiza la entrada ya guardada en el historial en lugar de crear
  // una nueva (evita duplicar la sesión).
  function setSessionEffort(rating) {
    if (!lastSession.value) return
    lastSession.value.effort = rating
    const entry = history.value.find(s => s.id === lastSession.value.id)
    if (entry) entry.effort = rating
    localStorage.setItem('keguel_history', JSON.stringify(history.value))
  }

  // ─── Máquina de estados de fases ─────────────
  //
  //  Ciclo sin reverse:  contract → rest → [siguiente rep]
  //  Ciclo con reverse:  contract → rest → reverse → rest → [siguiente rep]
  //
  function _nextPhase() {
    if (phase.value === 'contract') {
      phase.value         = 'rest'
      phaseTimeLeft.value = restDuration.value
    }
    else if (phase.value === 'rest') {
      if (hasReverse.value) {
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
    else if (phase.value === 'transition') {
      // Fin del descanso entre bloques → arranca el nuevo bloque (ya activo)
      phase.value         = 'contract'
      phaseTimeLeft.value = contractDuration.value
    }
  }

  function _advanceRep() {
    currentRep.value++
    if (currentRep.value >= totalReps.value) {
      // Bloque terminado: pasar al siguiente o completar la sesión
      if (currentBlockIndex.value < blocks.value.length - 1) {
        _startTransition()
      } else {
        completeSession()
      }
      return
    }
    _afterReverse.value = false
    phase.value         = 'contract'
    phaseTimeLeft.value = contractDuration.value
  }

  // Avanza al siguiente bloque pero abriendo un descanso de cambio de ejercicio.
  // currentBlockIndex se incrementa ya, de modo que la vista anticipa el próximo ejercicio.
  function _startTransition() {
    currentBlockIndex.value++
    currentRep.value    = 0
    _afterReverse.value = false
    phase.value         = 'transition'
    phaseTimeLeft.value = TRANSITION_REST
  }

  function _tick() {
    clearInterval(timer)
    timer = setInterval(() => {
      if (isPaused.value || !isActive.value) return
      elapsedTime.value++
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
    lastSession, history,
    blocks, currentBlock, currentBlockIndex, totalBlocks, isFreeMode, sessionName,
    pendingFree,
    totalReps, contractDuration, restDuration, reverseDuration,
    hasReverse, exerciseType, totalDuration, grandTotalReps, completedReps, progress,
    weekActivity,
    startSession, prepareFreeSession, consumePendingFree,
    pauseSession, resumeSession, stopSession, completeSession, setSessionEffort,
  }
})
