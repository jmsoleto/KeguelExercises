import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Límites médicos documentados
export const MAX_KEGELS_PER_DAY = 40
export const MAX_HOLD_SECONDS   = 10
export const OVERDOING_THRESHOLD = 35 // alerta preventiva

export const useSafetyStore = defineStore('safety', () => {

  // ─── Estado persistido ────────────────────────
  const _stored = JSON.parse(localStorage.getItem('keguel_safety') || '{}')
  const painReported    = ref(_stored.painReported ?? false)
  const painReportedAt  = ref(_stored.painReportedAt ?? null)

  function _persist() {
    localStorage.setItem('keguel_safety', JSON.stringify({
      painReported: painReported.value,
      painReportedAt: painReportedAt.value,
    }))
  }

  // ─── Computed desde historial ─────────────────

  function _todayRepsCount(history) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    return history
      .filter(s => {
        const d = new Date(s.date)
        return d >= today && d < tomorrow
      })
      .reduce((sum, s) => sum + (s.reps ?? 0), 0)
  }

  function dailyKegelsCount(history) {
    return _todayRepsCount(history)
  }

  function canStartSession(history) {
    if (painReported.value) return false
    return _todayRepsCount(history) < MAX_KEGELS_PER_DAY
  }

  function isOverdoing(history) {
    return _todayRepsCount(history) >= OVERDOING_THRESHOLD
  }

  function dailyLimitReached(history) {
    return _todayRepsCount(history) >= MAX_KEGELS_PER_DAY
  }

  // ─── Acciones ─────────────────────────────────

  function reportPain() {
    painReported.value   = true
    painReportedAt.value = new Date().toISOString()
    _persist()
  }

  function clearPainAlert() {
    painReported.value   = false
    painReportedAt.value = null
    _persist()
  }

  return {
    painReported,
    painReportedAt,
    dailyKegelsCount,
    canStartSession,
    isOverdoing,
    dailyLimitReached,
    reportPain,
    clearPainAlert,
    MAX_KEGELS_PER_DAY,
    MAX_HOLD_SECONDS,
    OVERDOING_THRESHOLD,
  }
})
