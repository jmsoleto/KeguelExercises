import { useSettingsStore } from './settings'

// ─────────────────────────────────────────────
// Servicio de feedback sonoro con Web Audio API
//
// Genera tonos sintetizados que indican al usuario
// qué fase toca sin mirar la pantalla:
//
//   contract → tono agudo ascendente (activación)
//   rest     → tono suave descendente (relajar)
//   reverse  → doble beep corto (atención, empuja)
//   complete → acorde mayor (sesión completada)
// ─────────────────────────────────────────────

let audioCtx = null

function getContext() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    return audioCtx
  } catch (e) {
    console.warn('[Sound] No se pudo crear AudioContext:', e)
    return null
  }
}

function playTone(freq, duration = 0.15, type = 'sine', volume = 0.3) {
  const ctx = getContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.value = freq

  // Envelope suave para evitar clics
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

// ─── Sonidos por fase ───────────────────────

function contractSound() {
  // Tono ascendente: "activar"
  const ctx = getContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, ctx.currentTime)       // A4
  osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.2) // E5

  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)
}

function restSound() {
  // Tono descendente suave: "soltar"
  const ctx = getContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(523, ctx.currentTime)       // C5
  osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.3) // E4

  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.4)
}

function reverseSound() {
  // Doble beep corto: "atención, reverse"
  playTone(587, 0.08, 'triangle', 0.25) // D5
  setTimeout(() => playTone(587, 0.08, 'triangle', 0.25), 120)
}

function completeSound() {
  // Acorde mayor ascendente: C-E-G-C
  const delays = [0, 80, 160, 300]
  const freqs  = [523, 659, 784, 1047]
  delays.forEach((delay, i) => {
    setTimeout(() => playTone(freqs[i], 0.4, 'sine', 0.2), delay)
  })
}

function tickSound() {
  // Tick sutil para los últimos 3 segundos
  playTone(880, 0.05, 'sine', 0.1)
}

// ─── API pública como composable ────────────

export function useSoundService() {
  function isEnabled() {
    const settings = useSettingsStore()
    return settings.sound
  }

  function enable() {
    const settings = useSettingsStore()
    settings.sound = true
    getContext() // user gesture context
  }

  function disable() {
    const settings = useSettingsStore()
    settings.sound = false
  }

  function playPhaseChange(phase) {
    if (!isEnabled()) return
    try {
      const sounds = {
        contract: contractSound,
        rest:     restSound,
        reverse:  reverseSound,
      }
      ;(sounds[phase] ?? restSound)()
    } catch (e) {
      console.warn('[Sound] Error en playPhaseChange:', e)
    }
  }

  function playComplete() {
    if (!isEnabled()) return
    try { completeSound() } catch (e) { console.warn('[Sound] Error en playComplete:', e) }
  }

  function playTick() {
    if (!isEnabled()) return
    try { tickSound() } catch (e) { console.warn('[Sound] Error en playTick:', e) }
  }

  return {
    get enabled() { return isEnabled() },
    enable, disable,
    playPhaseChange, playComplete, playTick,
  }
}
