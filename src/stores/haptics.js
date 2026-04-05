import { useSettingsStore } from './settings'

// ─────────────────────────────────────────────
// Servicio de vibración para feedback háptico
//
// Usa Capacitor Haptics en nativo y navigator.vibrate como fallback web.
//
// Patrones por fase:
//   contract → vibración fuerte corta (activar músculo)
//   rest     → vibración suave doble (soltar)
//   reverse  → vibración triple rápida (atención)
//   prepare  → vibración media sostenida (prepararse)
//   descend  → vibración media doble lenta (bajar niveles)
//   complete → vibración larga satisfactoria
// ─────────────────────────────────────────────

const isCapacitor = () =>
  typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()

let Haptics = null

async function getHaptics() {
  if (Haptics) return Haptics
  if (isCapacitor()) {
    try {
      const mod = await import('@capacitor/haptics')
      Haptics = mod.Haptics
    } catch (e) {
      console.warn('[Haptics] No se pudo cargar el plugin:', e)
    }
  }
  return Haptics
}

// Fallback web usando navigator.vibrate
function webVibrate(pattern) {
  if (navigator?.vibrate) navigator.vibrate(pattern)
}

// ─── Patrones por fase ──────────────────────

async function vibrateContract() {
  const h = await getHaptics()
  if (h) {
    await h.impact({ style: 'heavy' })
  } else {
    webVibrate(80)
  }
}

async function vibrateRest() {
  const h = await getHaptics()
  if (h) {
    await h.impact({ style: 'light' })
    setTimeout(() => h.impact({ style: 'light' }), 150)
  } else {
    webVibrate([40, 100, 40])
  }
}

async function vibrateReverse() {
  const h = await getHaptics()
  if (h) {
    await h.impact({ style: 'medium' })
    setTimeout(() => h.impact({ style: 'medium' }), 100)
    setTimeout(() => h.impact({ style: 'medium' }), 200)
  } else {
    webVibrate([30, 60, 30, 60, 30])
  }
}

async function vibratePrepare() {
  const h = await getHaptics()
  if (h) {
    await h.impact({ style: 'medium' })
    setTimeout(() => h.impact({ style: 'light' }), 200)
  } else {
    webVibrate([60, 120, 40])
  }
}

async function vibrateDescend() {
  const h = await getHaptics()
  if (h) {
    await h.impact({ style: 'medium' })
    setTimeout(() => h.impact({ style: 'medium' }), 250)
  } else {
    webVibrate([50, 150, 50])
  }
}

async function vibrateComplete() {
  const h = await getHaptics()
  if (h) {
    await h.notification({ type: 'success' })
  } else {
    webVibrate([100, 50, 100, 50, 200])
  }
}

async function vibrateTick() {
  const h = await getHaptics()
  if (h) {
    await h.impact({ style: 'light' })
  } else {
    webVibrate(15)
  }
}

// ─── API pública ────────────────────────────

export function useHapticsService() {
  function isEnabled() {
    const settings = useSettingsStore()
    return settings.vibration
  }

  async function phaseChange(phase) {
    if (!isEnabled()) return
    try {
      const map = {
        contract: vibrateContract,
        rest:     vibrateRest,
        reverse:  vibrateReverse,
        prepare:  vibratePrepare,
        descend:  vibrateDescend,
      }
      await (map[phase] ?? vibrateRest)()
    } catch (e) {
      console.warn('[Haptics] Error en phaseChange:', e)
    }
  }

  async function complete() {
    if (!isEnabled()) return
    try {
      await vibrateComplete()
    } catch (e) {
      console.warn('[Haptics] Error en complete:', e)
    }
  }

  async function tick() {
    if (!isEnabled()) return
    try {
      await vibrateTick()
    } catch (e) {
      console.warn('[Haptics] Error en tick:', e)
    }
  }

  return { phaseChange, complete, tick }
}
