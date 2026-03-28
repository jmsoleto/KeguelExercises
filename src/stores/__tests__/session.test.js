import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSessionStore } from '../session'

describe('useSessionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const slowRoutine = {
    name: 'Test Slow',
    reps: 3,
    contractSeconds: 2,
    restSeconds: 2,
    reverseSeconds: 0,
    type: 'slow',
  }

  const reverseRoutine = {
    name: 'Test Reverse',
    reps: 2,
    contractSeconds: 2,
    restSeconds: 2,
    reverseSeconds: 3,
    type: 'reverse',
  }

  describe('startSession', () => {
    it('initializes session state correctly', () => {
      const store = useSessionStore()
      store.startSession(slowRoutine)

      expect(store.isActive).toBe(true)
      expect(store.isPaused).toBe(false)
      expect(store.phase).toBe('contract')
      expect(store.currentRep).toBe(0)
      expect(store.elapsedTime).toBe(0)
      expect(store.phaseTimeLeft).toBe(2)
    })

    it('sets routine config from input', () => {
      const store = useSessionStore()
      store.startSession(slowRoutine)

      expect(store.totalReps).toBe(3)
      expect(store.contractDuration).toBe(2)
      expect(store.restDuration).toBe(2)
      expect(store.reverseDuration).toBe(0)
      expect(store.hasReverse).toBe(false)
    })
  })

  describe('computed values', () => {
    it('calculates totalDuration for slow routine', () => {
      const store = useSessionStore()
      store.startSession(slowRoutine)
      // 3 reps × (2s contract + 2s rest) = 12s
      expect(store.totalDuration).toBe(12)
    })

    it('calculates totalDuration for reverse routine', () => {
      const store = useSessionStore()
      store.startSession(reverseRoutine)
      // 2 reps × (2s contract + 2s rest + 3s reverse + 2s rest) = 18s
      expect(store.totalDuration).toBe(18)
    })

    it('calculates progress', () => {
      const store = useSessionStore()
      store.startSession(slowRoutine)
      expect(store.progress).toBe(0)
    })
  })

  describe('phase state machine (slow)', () => {
    it('transitions contract → rest → next rep', () => {
      const store = useSessionStore()
      store.startSession(slowRoutine)

      expect(store.phase).toBe('contract')
      expect(store.phaseTimeLeft).toBe(2)

      // Tick 2 seconds (contract phase ends)
      vi.advanceTimersByTime(1000)
      vi.advanceTimersByTime(1000)

      expect(store.phase).toBe('rest')
      expect(store.phaseTimeLeft).toBe(2)

      // Tick 2 more seconds (rest phase ends → next rep)
      vi.advanceTimersByTime(1000)
      vi.advanceTimersByTime(1000)

      expect(store.phase).toBe('contract')
      expect(store.currentRep).toBe(1)
    })
  })

  describe('phase state machine (reverse)', () => {
    it('transitions contract → rest → reverse → rest → next rep', () => {
      const store = useSessionStore()
      store.startSession(reverseRoutine)

      expect(store.phase).toBe('contract')

      // contract (2s)
      vi.advanceTimersByTime(2000)
      expect(store.phase).toBe('rest')

      // rest (2s)
      vi.advanceTimersByTime(2000)
      expect(store.phase).toBe('reverse')

      // reverse (3s)
      vi.advanceTimersByTime(3000)
      expect(store.phase).toBe('rest')

      // rest after reverse (2s) → advance rep
      vi.advanceTimersByTime(2000)
      expect(store.phase).toBe('contract')
      expect(store.currentRep).toBe(1)
    })
  })

  describe('session completion', () => {
    it('completes when all reps are done', () => {
      const store = useSessionStore()
      store.startSession({ ...slowRoutine, reps: 1 })

      // 1 rep: 2s contract + 2s rest = done
      vi.advanceTimersByTime(4000)

      expect(store.isActive).toBe(false)
      expect(store.lastSession).not.toBeNull()
      expect(store.lastSession.reps).toBe(1)
      expect(store.lastSession.accuracy).toBe(100)
    })

    it('saves session to history and localStorage', () => {
      const store = useSessionStore()
      store.startSession({ ...slowRoutine, reps: 1 })
      vi.advanceTimersByTime(4000)

      expect(store.history.length).toBe(1)
      const saved = JSON.parse(localStorage.getItem('keguel_history'))
      expect(saved.length).toBe(1)
    })
  })

  describe('pause / resume / stop', () => {
    it('pauses and resumes the session', () => {
      const store = useSessionStore()
      store.startSession(slowRoutine)

      vi.advanceTimersByTime(1000)
      expect(store.elapsedTime).toBe(1)

      store.pauseSession()
      expect(store.isPaused).toBe(true)

      vi.advanceTimersByTime(3000)
      // Time should not advance while paused
      expect(store.elapsedTime).toBe(1)

      store.resumeSession()
      expect(store.isPaused).toBe(false)

      vi.advanceTimersByTime(1000)
      expect(store.elapsedTime).toBe(2)
    })

    it('stops the session', () => {
      const store = useSessionStore()
      store.startSession(slowRoutine)

      vi.advanceTimersByTime(1000)
      store.stopSession()

      expect(store.isActive).toBe(false)
      expect(store.phase).toBe('rest')
    })
  })

  describe('weekActivity', () => {
    it('marks today as active if there is a session today', () => {
      const store = useSessionStore()
      store.history.push({
        id: 1,
        date: new Date().toISOString(),
        reps: 10,
        totalReps: 10,
      })

      const todayIdx = (new Date().getDay() + 6) % 7
      expect(store.weekActivity[todayIdx]).toBe(true)
    })

    it('returns all false for empty history', () => {
      const store = useSessionStore()
      expect(store.weekActivity.every(v => v === false)).toBe(true)
    })
  })
})
