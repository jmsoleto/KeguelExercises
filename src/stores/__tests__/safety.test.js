import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSafetyStore, MAX_KEGELS_PER_DAY, OVERDOING_THRESHOLD } from '../safety'

describe('useSafetyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function todaySession(reps) {
    return { date: new Date().toISOString(), reps }
  }

  function yesterdaySession(reps) {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return { date: d.toISOString(), reps }
  }

  describe('dailyKegelsCount', () => {
    it('counts reps from today only', () => {
      const store = useSafetyStore()
      const history = [
        todaySession(10),
        todaySession(15),
        yesterdaySession(20), // should not count
      ]

      expect(store.dailyKegelsCount(history)).toBe(25)
    })

    it('returns 0 for empty history', () => {
      const store = useSafetyStore()
      expect(store.dailyKegelsCount([])).toBe(0)
    })
  })

  describe('canStartSession', () => {
    it('returns true when under limit', () => {
      const store = useSafetyStore()
      const history = [todaySession(10)]
      expect(store.canStartSession(history)).toBe(true)
    })

    it('returns false when at limit', () => {
      const store = useSafetyStore()
      const history = [todaySession(MAX_KEGELS_PER_DAY)]
      expect(store.canStartSession(history)).toBe(false)
    })

    it('returns false when pain is reported', () => {
      const store = useSafetyStore()
      store.reportPain()
      expect(store.canStartSession([])).toBe(false)
    })
  })

  describe('isOverdoing', () => {
    it('returns false below threshold', () => {
      const store = useSafetyStore()
      expect(store.isOverdoing([todaySession(10)])).toBe(false)
    })

    it('returns true at threshold', () => {
      const store = useSafetyStore()
      expect(store.isOverdoing([todaySession(OVERDOING_THRESHOLD)])).toBe(true)
    })
  })

  describe('dailyLimitReached', () => {
    it('returns true at max', () => {
      const store = useSafetyStore()
      expect(store.dailyLimitReached([todaySession(MAX_KEGELS_PER_DAY)])).toBe(true)
    })
  })

  describe('pain reporting', () => {
    it('reports pain and persists', () => {
      const store = useSafetyStore()
      store.reportPain()

      expect(store.painReported).toBe(true)
      expect(store.painReportedAt).not.toBeNull()

      const saved = JSON.parse(localStorage.getItem('keguel_safety'))
      expect(saved.painReported).toBe(true)
    })

    it('clears pain alert', () => {
      const store = useSafetyStore()
      store.reportPain()
      store.clearPainAlert()

      expect(store.painReported).toBe(false)
      expect(store.painReportedAt).toBeNull()
    })

    it('loads pain state from localStorage', () => {
      localStorage.setItem('keguel_safety', JSON.stringify({
        painReported: true,
        painReportedAt: '2025-01-01T00:00:00.000Z',
      }))

      setActivePinia(createPinia())
      const store = useSafetyStore()

      expect(store.painReported).toBe(true)
    })
  })
})
