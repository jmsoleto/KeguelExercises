import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRoutinesStore, PROGRAMS } from '../routines'

describe('useRoutinesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('PROGRAMS data', () => {
    it('has 3 programs', () => {
      expect(PROGRAMS).toHaveLength(3)
    })

    it('each program has 4 phases covering weeks 1-12', () => {
      PROGRAMS.forEach(program => {
        expect(program.phases).toHaveLength(4)
        const allWeeks = program.phases.flatMap(p => {
          const [from, to] = p.weeks
          return Array.from({ length: to - from + 1 }, (_, i) => from + i)
        })
        expect(allWeeks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      })
    })

    it('each phase has at least one set', () => {
      PROGRAMS.forEach(program => {
        program.phases.forEach(phase => {
          expect(phase.sets.length).toBeGreaterThanOrEqual(1)
        })
      })
    })

    it('each set has valid type', () => {
      const validTypes = ['slow', 'fast', 'reverse']
      PROGRAMS.forEach(program => {
        program.phases.forEach(phase => {
          phase.sets.forEach(set => {
            expect(validTypes).toContain(set.type)
            expect(set.reps).toBeGreaterThan(0)
            expect(set.contractSeconds).toBeGreaterThan(0)
            expect(set.restSeconds).toBeGreaterThan(0)
          })
        })
      })
    })

    it('reverse sets have reverseSeconds', () => {
      PROGRAMS.forEach(program => {
        program.phases.forEach(phase => {
          phase.sets.forEach(set => {
            if (set.type === 'reverse') {
              expect(set.reverseSeconds).toBeGreaterThan(0)
            }
          })
        })
      })
    })
  })

  describe('selectProgram', () => {
    it('selects a program and resets to week 1', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      expect(store.selectedProgramId).toBe('control')
      expect(store.currentWeek).toBe(1)
      expect(store.selectedProgram.name).toBe('Control Total')
      expect(localStorage.getItem('keguel_program')).toBe('control')
    })

    it('sets activePhase to first phase on selection', () => {
      const store = useRoutinesStore()
      store.selectProgram('erection')

      expect(store.activePhase.name).toBe('Base vascular')
      expect(store.activePhase.weeks).toEqual([1, 2])
    })
  })

  describe('resetProgram', () => {
    it('clears the selected program', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')
      store.resetProgram()

      expect(store.selectedProgramId).toBeNull()
      expect(store.selectedProgram).toBeNull()
      expect(store.currentWeek).toBe(1)
    })
  })

  describe('activePhase', () => {
    it('returns correct phase for week 1', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      expect(store.activePhase.name).toBe('Activación')
    })

    it('returns correct phase for week 5', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      // Advance to week 5
      for (let i = 0; i < 4; i++) store.advanceWeek()

      expect(store.currentWeek).toBe(5)
      expect(store.activePhase.name).toBe('Control bidireccional')
    })

    it('returns correct phase for week 12', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      for (let i = 0; i < 11; i++) store.advanceWeek()

      expect(store.currentWeek).toBe(12)
      expect(store.activePhase.name).toBe('Maestría')
    })

    it('returns null when no program selected', () => {
      const store = useRoutinesStore()
      expect(store.activePhase).toBeNull()
    })
  })

  describe('advanceWeek', () => {
    it('increments currentWeek', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')
      store.advanceWeek()

      expect(store.currentWeek).toBe(2)
      expect(localStorage.getItem('keguel_week')).toBe('2')
    })

    it('does not go past week 12', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      for (let i = 0; i < 15; i++) store.advanceWeek()

      expect(store.currentWeek).toBe(12)
    })
  })

  describe('tryAdvanceWeek', () => {
    it('does not advance without enough sessions', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      const result = store.tryAdvanceWeek([])
      expect(result.advanced).toBe(false)
      expect(result.sessionsThisWeek).toBe(0)
      expect(result.required).toBe(2)
      expect(store.currentWeek).toBe(1)
    })

    it('advances with enough sessions this week', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      const now = new Date()
      const history = [
        { date: now.toISOString() },
        { date: now.toISOString() },
      ]

      const result = store.tryAdvanceWeek(history)
      expect(result.advanced).toBe(true)
      expect(store.currentWeek).toBe(2)
    })
  })

  describe('activeSet', () => {
    it('defaults to first set', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      expect(store.activeSetIndex).toBe(0)
      expect(store.activeSet.type).toBe('slow')
    })

    it('can switch to different set', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      // Go to week 3 (Conciencia phase — has 2 sets)
      store.advanceWeek()
      store.advanceWeek()

      store.setActiveSet(1)
      expect(store.activeSet.type).toBe('fast')
    })
  })

  describe('activeRoutineConfig', () => {
    it('returns timer-compatible config', () => {
      const store = useRoutinesStore()
      store.selectProgram('control')

      const config = store.activeRoutineConfig
      expect(config).toHaveProperty('name')
      expect(config).toHaveProperty('reps')
      expect(config).toHaveProperty('contractSeconds')
      expect(config).toHaveProperty('restSeconds')
      expect(config).toHaveProperty('reverseSeconds')
      expect(config).toHaveProperty('type')
      expect(config.name).toContain('Control Total')
    })

    it('returns null when no program selected', () => {
      const store = useRoutinesStore()
      expect(store.activeRoutineConfig).toBeNull()
    })
  })

  describe('weekSessionCount', () => {
    it('counts sessions in current week', () => {
      const store = useRoutinesStore()
      const now = new Date()
      const lastWeek = new Date(now)
      lastWeek.setDate(now.getDate() - 8)

      const history = [
        { date: now.toISOString() },
        { date: now.toISOString() },
        { date: lastWeek.toISOString() }, // should not count
      ]

      expect(store.weekSessionCount(history)).toBe(2)
    })
  })
})
