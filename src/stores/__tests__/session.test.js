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

  // ─── Fixtures ────────────────────────────────

  const longHoldsRoutine = {
    name: 'Test Long Holds',
    exerciseId: 'long_holds',
    reps: 3,
    contractSeconds: 2,
    restSeconds: 2,
    reverseSeconds: 0,
    levels: 0,
    prepareSeconds: 0,
    type: 'long_holds',
  }

  const quickFlicksRoutine = {
    name: 'Test Quick Flicks',
    exerciseId: 'quick_flicks',
    reps: 5,
    contractSeconds: 1,
    restSeconds: 1,
    reverseSeconds: 0,
    levels: 0,
    prepareSeconds: 0,
    type: 'quick_flicks',
  }

  const reverseKegelRoutine = {
    name: 'Test Reverse Kegel',
    exerciseId: 'reverse_kegel',
    reps: 2,
    contractSeconds: 3,
    restSeconds: 2,
    reverseSeconds: 3, // same as contractSeconds for reverse_kegel
    levels: 0,
    prepareSeconds: 0,
    type: 'reverse_kegel',
  }

  const elevatorRoutine = {
    name: 'Test Elevator',
    exerciseId: 'elevator',
    reps: 2,
    contractSeconds: 4, // 4 levels × 1s per level
    restSeconds: 2,
    reverseSeconds: 0,
    levels: 4,
    prepareSeconds: 0,
    type: 'elevator',
  }

  const isometricRoutine = {
    name: 'Test Isometric',
    exerciseId: 'isometric_hold',
    reps: 2,
    contractSeconds: 4, // 4 levels × 1s per level
    restSeconds: 2,
    reverseSeconds: 0,
    levels: 4,
    prepareSeconds: 0,
    type: 'isometric_hold',
  }

  const bridgeKegelRoutine = {
    name: 'Test Bridge Kegel',
    exerciseId: 'bridge_kegel',
    reps: 2,
    contractSeconds: 3,
    restSeconds: 2,
    reverseSeconds: 0,
    levels: 0,
    prepareSeconds: 5,
    type: 'bridge_kegel',
  }

  const squatKegelRoutine = {
    name: 'Test Squat Kegel',
    exerciseId: 'squat_kegel',
    reps: 2,
    contractSeconds: 3,
    restSeconds: 2,
    reverseSeconds: 0,
    levels: 0,
    prepareSeconds: 5,
    type: 'squat_kegel',
  }

  // Helper: advance through ready phase (5s)
  function skipReady() {
    vi.advanceTimersByTime(5000)
  }

  // ─── Tests ───────────────────────────────────

  describe('startSession', () => {
    it('initializes with ready phase', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine)

      expect(store.isActive).toBe(true)
      expect(store.isPaused).toBe(false)
      expect(store.phase).toBe('ready')
      expect(store.phaseTimeLeft).toBe(5)
      expect(store.currentRep).toBe(0)
      expect(store.elapsedTime).toBe(0)
    })

    it('transitions from ready to contract for long_holds', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine)

      skipReady()

      expect(store.phase).toBe('contract')
      expect(store.phaseTimeLeft).toBe(2)
    })

    it('sets routine config from input', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine)

      expect(store.totalReps).toBe(3)
      expect(store.contractDuration).toBe(2)
      expect(store.restDuration).toBe(2)
      expect(store.reverseDuration).toBe(0)
      expect(store.hasReverse).toBe(false)
      expect(store.hasLevels).toBe(false)
      expect(store.hasPrepare).toBe(false)
    })
  })

  describe('long_holds (basic contraction)', () => {
    it('transitions: contract → rest → next rep', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine)
      skipReady()

      expect(store.phase).toBe('contract')
      vi.advanceTimersByTime(2000) // contract 2s
      expect(store.phase).toBe('rest')
      vi.advanceTimersByTime(2000) // rest 2s
      expect(store.phase).toBe('contract')
      expect(store.currentRep).toBe(1)
    })

    it('calculates totalDuration correctly', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine)
      // 3 reps × (2s contract + 2s rest) = 12s
      expect(store.totalDuration).toBe(12)
    })
  })

  describe('quick_flicks', () => {
    it('works same as long_holds with short times', () => {
      const store = useSessionStore()
      store.startSession(quickFlicksRoutine)
      skipReady()

      expect(store.phase).toBe('contract')
      vi.advanceTimersByTime(1000) // contract 1s
      expect(store.phase).toBe('rest')
      vi.advanceTimersByTime(1000) // rest 1s
      expect(store.phase).toBe('contract')
      expect(store.currentRep).toBe(1)
    })
  })

  describe('reverse_kegel', () => {
    it('transitions: reverse → rest → next rep', () => {
      const store = useSessionStore()
      store.startSession(reverseKegelRoutine)
      skipReady()

      // reverse_kegel: primary phase is 'reverse'
      expect(store.phase).toBe('reverse')
      expect(store.phaseTimeLeft).toBe(3)

      vi.advanceTimersByTime(3000) // reverse 3s
      expect(store.phase).toBe('rest')

      vi.advanceTimersByTime(2000) // rest 2s
      expect(store.phase).toBe('reverse')
      expect(store.currentRep).toBe(1)
    })

    it('calculates totalDuration correctly', () => {
      const store = useSessionStore()
      store.startSession(reverseKegelRoutine)
      // 2 reps × (3s reverse + 2s rest) = 10s
      expect(store.totalDuration).toBe(10)
    })
  })

  describe('elevator', () => {
    it('transitions: contract → descend → rest → next rep', () => {
      const store = useSessionStore()
      store.startSession(elevatorRoutine)
      skipReady()

      expect(store.phase).toBe('contract')
      expect(store.phaseTimeLeft).toBe(4)

      vi.advanceTimersByTime(4000) // contract (ascend) 4s
      expect(store.phase).toBe('descend')
      expect(store.phaseTimeLeft).toBe(4) // descend same duration

      vi.advanceTimersByTime(4000) // descend 4s
      expect(store.phase).toBe('rest')

      vi.advanceTimersByTime(2000) // rest 2s
      expect(store.phase).toBe('contract')
      expect(store.currentRep).toBe(1)
    })

    it('calculates totalDuration correctly', () => {
      const store = useSessionStore()
      store.startSession(elevatorRoutine)
      // 2 reps × (4s contract + 4s descend + 2s rest) = 20s
      expect(store.totalDuration).toBe(20)
    })

    it('has ascending levels during contract phase', () => {
      const store = useSessionStore()
      store.startSession(elevatorRoutine)
      skipReady()

      expect(store.phase).toBe('contract')
      expect(store.currentLevel).toBe(1) // start at level 1

      vi.advanceTimersByTime(1000) // 1s elapsed
      expect(store.currentLevel).toBe(2)

      vi.advanceTimersByTime(1000) // 2s elapsed
      expect(store.currentLevel).toBe(3)

      vi.advanceTimersByTime(1000) // 3s elapsed
      expect(store.currentLevel).toBe(4)
    })

    it('has descending levels during descend phase', () => {
      const store = useSessionStore()
      store.startSession(elevatorRoutine)
      skipReady()

      vi.advanceTimersByTime(4000) // finish contract, enter descend
      expect(store.phase).toBe('descend')
      expect(store.currentLevel).toBe(4) // start at top

      vi.advanceTimersByTime(1000)
      expect(store.currentLevel).toBe(3)

      vi.advanceTimersByTime(1000)
      expect(store.currentLevel).toBe(2)

      vi.advanceTimersByTime(1000)
      expect(store.currentLevel).toBe(1)
    })

    it('returns null level during rest phase', () => {
      const store = useSessionStore()
      store.startSession(elevatorRoutine)
      skipReady()

      vi.advanceTimersByTime(8000) // contract + descend
      expect(store.phase).toBe('rest')
      expect(store.currentLevel).toBeNull()
    })
  })

  describe('isometric_hold', () => {
    it('transitions: contract → rest (no descend)', () => {
      const store = useSessionStore()
      store.startSession(isometricRoutine)
      skipReady()

      expect(store.phase).toBe('contract')
      vi.advanceTimersByTime(4000)
      // No descend phase for isometric
      expect(store.phase).toBe('rest')

      vi.advanceTimersByTime(2000)
      expect(store.phase).toBe('contract')
      expect(store.currentRep).toBe(1)
    })

    it('has ascending levels during contract', () => {
      const store = useSessionStore()
      store.startSession(isometricRoutine)
      skipReady()

      expect(store.currentLevel).toBe(1)
      vi.advanceTimersByTime(1000)
      expect(store.currentLevel).toBe(2)
      vi.advanceTimersByTime(1000)
      expect(store.currentLevel).toBe(3)
      vi.advanceTimersByTime(1000)
      expect(store.currentLevel).toBe(4)
    })

    it('calculates totalDuration correctly', () => {
      const store = useSessionStore()
      store.startSession(isometricRoutine)
      // 2 reps × (4s contract + 2s rest) = 12s (no descend)
      expect(store.totalDuration).toBe(12)
    })
  })

  describe('bridge_kegel (compound with prepare)', () => {
    it('transitions: prepare → contract → rest → next rep (no prepare on 2nd rep)', () => {
      const store = useSessionStore()
      store.startSession(bridgeKegelRoutine)
      skipReady()

      // First: prepare phase
      expect(store.phase).toBe('prepare')
      expect(store.phaseTimeLeft).toBe(5)

      vi.advanceTimersByTime(5000) // prepare 5s
      expect(store.phase).toBe('contract')

      vi.advanceTimersByTime(3000) // contract 3s
      expect(store.phase).toBe('rest')

      vi.advanceTimersByTime(2000) // rest 2s
      // Second rep: NO prepare again
      expect(store.phase).toBe('contract')
      expect(store.currentRep).toBe(1)
    })

    it('calculates totalDuration including prepare', () => {
      const store = useSessionStore()
      store.startSession(bridgeKegelRoutine)
      // 5s prepare + 2 reps × (3s contract + 2s rest) = 5 + 10 = 15s
      expect(store.totalDuration).toBe(15)
    })
  })

  describe('squat_kegel (compound with prepare)', () => {
    it('has prepare phase before first rep', () => {
      const store = useSessionStore()
      store.startSession(squatKegelRoutine)
      skipReady()

      expect(store.phase).toBe('prepare')
      expect(store.phaseTimeLeft).toBe(5)

      vi.advanceTimersByTime(5000)
      expect(store.phase).toBe('contract')
    })
  })

  describe('session completion', () => {
    it('completes when all reps are done', () => {
      const store = useSessionStore()
      store.startSession({ ...longHoldsRoutine, reps: 1 })
      skipReady()

      vi.advanceTimersByTime(4000) // 2s contract + 2s rest

      expect(store.isActive).toBe(false)
      expect(store.lastSession).not.toBeNull()
      expect(store.lastSession.reps).toBe(1)
      expect(store.lastSession.accuracy).toBe(100)
      expect(store.lastSession.exerciseId).toBe('long_holds')
    })

    it('saves session to history and localStorage', () => {
      const store = useSessionStore()
      store.startSession({ ...longHoldsRoutine, reps: 1 })
      skipReady()
      vi.advanceTimersByTime(4000)

      expect(store.history.length).toBe(1)
      const saved = JSON.parse(localStorage.getItem('keguel_history'))
      expect(saved.length).toBe(1)
    })
  })

  describe('pause / resume / stop', () => {
    it('pauses and resumes the session', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine)
      skipReady()

      vi.advanceTimersByTime(1000)
      expect(store.elapsedTime).toBe(1)

      store.pauseSession()
      vi.advanceTimersByTime(3000)
      expect(store.elapsedTime).toBe(1) // frozen

      store.resumeSession()
      vi.advanceTimersByTime(1000)
      expect(store.elapsedTime).toBe(2)
    })

    it('stops the session', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine)

      vi.advanceTimersByTime(1000)
      store.stopSession()

      expect(store.isActive).toBe(false)
      expect(store.phase).toBe('rest')
    })
  })

  describe('multi-exercise queue', () => {
    it('tracks queue position', () => {
      const store = useSessionStore()
      const queue = [longHoldsRoutine, quickFlicksRoutine]
      store.startSession(longHoldsRoutine, queue)

      expect(store.totalExercisesInQueue).toBe(2)
      expect(store.currentExerciseIndex).toBe(0)
      expect(store.hasMoreExercises).toBe(true)
    })

    it('advances to next exercise', () => {
      const store = useSessionStore()
      const queue = [
        { ...longHoldsRoutine, reps: 1 },
        quickFlicksRoutine,
      ]
      store.startSession(queue[0], queue)

      // Complete first exercise
      skipReady()
      vi.advanceTimersByTime(4000) // 2s contract + 2s rest
      expect(store.isActive).toBe(false)

      // Advance to next
      const advanced = store.advanceToNextExercise()
      expect(advanced).toBe(true)
      expect(store.isActive).toBe(true)
      expect(store.currentExerciseIndex).toBe(1)
      expect(store.exerciseType).toBe('quick_flicks')
      expect(store.hasMoreExercises).toBe(false)
    })

    it('returns false when no more exercises', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine, [longHoldsRoutine])

      expect(store.hasMoreExercises).toBe(false)
      expect(store.advanceToNextExercise()).toBe(false)
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

  describe('currentLevel for non-leveled exercises', () => {
    it('returns null', () => {
      const store = useSessionStore()
      store.startSession(longHoldsRoutine)
      skipReady()

      expect(store.currentLevel).toBeNull()
    })
  })
})
