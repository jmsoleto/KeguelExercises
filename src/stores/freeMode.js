import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { TRANSITION_REST } from '@/stores/session'

// ─────────────────────────────────────────────
// MODO LIBRE
//
// El usuario construye una secuencia ordenada de bloques. Cada bloque es
// uno de los tres tipos de ejercicio y define sus repeticiones (y, en las
// largas, la duración de la contracción). Puede añadir tantos bloques como
// quiera, reordenarlos y eliminarlos.
//
//   - slow    → largas  (contracción lenta sostenida)
//   - fast    → cortas   (contracción explosiva corta)
//   - reverse → empuje   (reverse Kegel, empujar afuera)
//
// La secuencia se persiste, de modo que la siguiente sesión arranca igual.
// ─────────────────────────────────────────────

const STORAGE_KEY = 'keguel_free_config'

// Niveles de duración (segundos) seleccionables por tipo de ejercicio.
// En largas/cortas es la duración de la contracción; en empuje, la del empuje afuera.
export const DURATION_OPTIONS = {
  slow:    [5, 8, 10],
  fast:    [1, 2, 3, 4],
  reverse: [2, 5, 8],
}

// Nivel inicial al crear un bloque de cada tipo
const DEFAULT_DURATION = { slow: 5, fast: 2, reverse: 5 }

function defaultDuration(type) { return DEFAULT_DURATION[type] }

// Duraciones fijas (segundos) por tipo de ejercicio (las variables se ajustan luego)
const DURATIONS = {
  slow:    { contractSeconds: 5, restSeconds: 5, reverseSeconds: 0 },
  fast:    { contractSeconds: 2, restSeconds: 2, reverseSeconds: 0 },
  reverse: { contractSeconds: 3, restSeconds: 3, reverseSeconds: 5 },
}

// type de ejercicio → clave de etiqueta i18n
const LABEL_KEY = { slow: 'long', fast: 'short', reverse: 'push' }

// Secuencia inicial por defecto
const DEFAULT_ITEMS = [
  { type: 'slow',    reps: 10, duration: 5 },
  { type: 'fast',    reps: 15, duration: 2 },
  { type: 'reverse', reps: 8,  duration: 5 },
]

let _uid = 0
function nextId() { return ++_uid }

// Normaliza un item: id fresco y campos por defecto.
// Si la duración guardada no es válida para el tipo, se ajusta al nivel por defecto.
function makeItem(it) {
  const options = DURATION_OPTIONS[it.type]
  const duration = options.includes(it.duration) ? it.duration : defaultDuration(it.type)
  return {
    id:       nextId(),
    type:     it.type,
    reps:     it.reps ?? 10,
    duration,
  }
}

// Carga + migración desde el formato antiguo ({ longReps, longSets, ... })
function loadItems() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  if (!stored) return DEFAULT_ITEMS.map(makeItem)

  if (Array.isArray(stored.items)) {
    return stored.items.map(makeItem)
  }

  // Migración desde la estructura previa (reps + tandas por tipo)
  const items = []
  const push = (type, reps, sets, duration) => {
    for (let i = 0; i < (sets || 0); i++) items.push(makeItem({ type, reps, duration }))
  }
  push('slow',    stored.longReps,  stored.longSets,  stored.longDuration || 5)
  push('fast',    stored.shortReps, stored.shortSets)
  push('reverse', stored.pushReps,  stored.pushSets)
  return items.length ? items : DEFAULT_ITEMS.map(makeItem)
}

export const useFreeModeStore = defineStore('freeMode', () => {
  const items = ref(loadItems())

  // Persistir automáticamente cualquier cambio
  watch(items, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: val }))
  }, { deep: true })

  // ─── Mutaciones ──────────────────────────────
  function addItem(type) {
    items.value.push(makeItem({ type, reps: type === 'fast' ? 15 : 10, duration: defaultDuration(type) }))
  }

  function removeItem(id) {
    items.value = items.value.filter(it => it.id !== id)
  }

  function move(id, dir) {
    const i = items.value.findIndex(it => it.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= items.value.length) return
    const arr = items.value
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  function setReps(id, reps) {
    const it = items.value.find(x => x.id === id)
    if (it) it.reps = Math.max(1, Math.min(99, reps))
  }

  function setDuration(id, duration) {
    const it = items.value.find(x => x.id === id)
    if (it && DURATION_OPTIONS[it.type].includes(duration)) it.duration = duration
  }

  // ─── Construcción de la sesión ───────────────
  function buildBlocks() {
    return items.value
      .filter(it => it.reps > 0)
      .map(it => {
        const block = {
          type:     it.type,
          reps:     it.reps,
          ...DURATIONS[it.type],
          labelKey: LABEL_KEY[it.type],
        }
        // La duración elegida ajusta la fase relevante según el tipo:
        //  - largas/cortas → duración de la contracción
        //  - empuje        → duración del empuje hacia afuera
        if (it.type === 'reverse') {
          block.reverseSeconds = it.duration
        } else {
          block.contractSeconds = it.duration
          // Cortas de 1s: el descanso también es de 1s para mantener el ritmo
          if (it.type === 'fast' && it.duration === 1) block.restSeconds = 1
        }
        return block
      })
  }

  // ─── Resúmenes ───────────────────────────────
  const totalReps   = computed(() => items.value.reduce((s, it) => s + it.reps, 0))
  const totalBlocks = computed(() => items.value.length)

  const totalMinutes = computed(() => {
    const built = buildBlocks()
    const secs = built.reduce((sum, b) => {
      const rep = b.contractSeconds + b.restSeconds +
        (b.reverseSeconds ? b.reverseSeconds + b.restSeconds : 0)
      return sum + b.reps * rep
    }, 0)
    // Descanso de 10s entre cada cambio de ejercicio
    const transitions = Math.max(0, built.length - 1) * TRANSITION_REST
    return Math.max(1, Math.ceil((secs + transitions) / 60))
  })

  const isValid = computed(() => totalBlocks.value > 0 && totalReps.value > 0)

  return {
    items,
    addItem, removeItem, move, setReps, setDuration,
    buildBlocks,
    totalReps, totalBlocks, totalMinutes, isValid,
  }
})
