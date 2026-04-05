import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRoutinesStore, PROGRAMS, EXERCISES } from '../routines'

const VALID_EXERCISE_IDS = EXERCISES.map(e => e.id)

describe('useRoutinesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('EXERCISES catalog', () => {
    it('has 7 exercise types', () => {
      expect(EXERCISES).toHaveLength(7)
    })

    it('each exercise has required fields', () => {
      EXERCISES.forEach(ex => {
        expect(ex.id).toBeTruthy()
        expect(ex.name).toBeTruthy()
        expect(ex.description).toBeTruthy()
        expect(ex.instructions.length).toBeGreaterThan(0)
        expect(ex.difficulty).toBeTruthy()
        expect(ex.category).toBeTruthy()
        expect(ex.iconKey).toBeTruthy()
      })
    })

    it('has unique IDs', () => {
      const ids = EXERCISES.map(e => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('PROGRAMS data', () => {
    it('has 6 programs', () => {
      expect(PROGRAMS).toHaveLength(6)
    })

    it('has unique IDs', () => {
      const ids = PROGRAMS.map(p => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('each program has required fields', () => {
      PROGRAMS.forEach(program => {
        expect(program.id).toBeTruthy()
        expect(program.name).toBeTruthy()
        expect(program.description).toBeTruthy()
        expect(program.phases.length).toBeGreaterThan(0)
        expect(program.sessionsPerDay).toBeGreaterThan(0)
      })
    })

    it('finite programs cover all weeks with their phases', () => {
      PROGRAMS.filter(p => p.totalWeeks !== null).forEach(program => {
        const coveredWeeks = new Set()
        program.phases.forEach(phase => {
          const [from, to] = phase.weeks
          for (let w = from; w <= to; w++) coveredWeeks.add(w)
        })
        for (let w = 1; w <= program.totalWeeks; w++) {
          expect(coveredWeeks.has(w)).toBe(true)
        }
      })
    })

    it('maintenance program has null totalWeeks', () => {
      const maintenance = PROGRAMS.find(p => p.id === 'maintenance')
      expect(maintenance).toBeTruthy()
      expect(maintenance.totalWeeks).toBeNull()
    })

    it('each phase has weeklySchedule with sessions', () => {
      PROGRAMS.forEach(program => {
        program.phases.forEach(phase => {
          expect(phase.weeklySchedule.length).toBeGreaterThan(0)
          phase.weeklySchedule.forEach(ws => {
            expect(ws.sessions.length).toBeGreaterThan(0)
          })
        })
      })
    })

    it('all exercises reference valid exercise IDs', () => {
      PROGRAMS.forEach(program => {
        program.phases.forEach(phase => {
          phase.weeklySchedule.forEach(ws => {
            ws.sessions.forEach(session => {
              session.exercises.forEach(ex => {
                expect(VALID_EXERCISE_IDS).toContain(ex.exerciseId)
                expect(ex.reps).toBeGreaterThan(0)
                expect(ex.contractSeconds).toBeGreaterThan(0)
                expect(ex.relaxSeconds).toBeGreaterThan(0)
              })
            })
          })
        })
      })
    })

    it('no exercise exceeds 10s hold (medical limit)', () => {
      PROGRAMS.forEach(program => {
        program.phases.forEach(phase => {
          phase.weeklySchedule.forEach(ws => {
            ws.sessions.forEach(session => {
              session.exercises.forEach(ex => {
                expect(ex.contractSeconds).toBeLessThanOrEqual(10)
              })
            })
          })
        })
      })
    })
  })

  describe('selectProgram', () => {
    it('selects a program and resets to week 1', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')

      expect(store.selectedProgramId).toBe('ejaculation_control')
      expect(store.currentWeek).toBe(1)
      expect(store.selectedProgram.name).toBe('Control eyaculatorio')
      expect(localStorage.getItem('keguel_program')).toBe('ejaculation_control')
    })

    it('sets activePhase to first phase on selection', () => {
      const store = useRoutinesStore()
      store.selectProgram('sexual_performance')

      expect(store.activePhase.name).toBe('Base vascular')
      expect(store.activePhase.weeks).toEqual([1, 2])
    })
  })

  describe('resetProgram', () => {
    it('clears the selected program', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')
      store.resetProgram()

      expect(store.selectedProgramId).toBeNull()
      expect(store.selectedProgram).toBeNull()
      expect(store.currentWeek).toBe(1)
    })
  })

  describe('activePhase', () => {
    it('returns correct phase for week 1', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')

      expect(store.activePhase.name).toBe('Activación')
    })

    it('returns correct phase for week 5', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')

      for (let i = 0; i < 4; i++) store.advanceWeek()

      expect(store.currentWeek).toBe(5)
      expect(store.activePhase.name).toBe('Control bidireccional')
    })

    it('returns correct phase for last week', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')

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
      store.selectProgram('ejaculation_control')
      store.advanceWeek()

      expect(store.currentWeek).toBe(2)
      expect(localStorage.getItem('keguel_week')).toBe('2')
    })

    it('does not go past totalWeeks for finite programs', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control') // 12 weeks

      for (let i = 0; i < 15; i++) store.advanceWeek()

      expect(store.currentWeek).toBe(12)
    })

    it('does not go past 4 weeks for foundations', () => {
      const store = useRoutinesStore()
      store.selectProgram('foundations') // 4 weeks

      for (let i = 0; i < 10; i++) store.advanceWeek()

      expect(store.currentWeek).toBe(4)
    })

    it('advances indefinitely for maintenance plan', () => {
      const store = useRoutinesStore()
      store.selectProgram('maintenance')

      for (let i = 0; i < 50; i++) store.advanceWeek()

      expect(store.currentWeek).toBe(51)
    })
  })

  describe('tryAdvanceWeek', () => {
    it('does not advance without enough sessions', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')

      const result = store.tryAdvanceWeek([])
      expect(result.advanced).toBe(false)
      expect(result.sessionsThisWeek).toBe(0)
      expect(result.required).toBe(2)
      expect(store.currentWeek).toBe(1)
    })

    it('advances with enough sessions this week', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')

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

  describe('todaySessions', () => {
    it('returns sessions for the current week', () => {
      const store = useRoutinesStore()
      store.selectProgram('foundations')

      expect(store.todaySessions.length).toBeGreaterThan(0)
      expect(store.todaySessions[0]).toHaveProperty('label')
      expect(store.todaySessions[0]).toHaveProperty('exercises')
    })

    it('returns empty array when no program selected', () => {
      const store = useRoutinesStore()
      expect(store.todaySessions).toEqual([])
    })
  })

  describe('activeSession and exercises', () => {
    it('defaults to first session', () => {
      const store = useRoutinesStore()
      store.selectProgram('foundations')

      expect(store.activeSessionIndex).toBe(0)
      expect(store.activeSession.label).toBe('Mañana')
    })

    it('can switch sessions', () => {
      const store = useRoutinesStore()
      store.selectProgram('foundations')

      // Week 1 foundations has 2 sessions (Mañana, Noche)
      store.setActiveSession(1)
      expect(store.activeSession.label).toBe('Noche')
    })

    it('activeExercises returns exercises of active session', () => {
      const store = useRoutinesStore()
      store.selectProgram('foundations')

      expect(store.activeExercises.length).toBeGreaterThan(0)
      expect(store.activeExercises[0]).toHaveProperty('exerciseId')
      expect(store.activeExercises[0]).toHaveProperty('reps')
    })

    it('nextExercise advances to next exercise', () => {
      const store = useRoutinesStore()
      store.selectProgram('urinary_control')

      // Advance to week 5 (Intensificación — afternoon has 2 exercises)
      for (let i = 0; i < 4; i++) store.advanceWeek()
      store.setActiveSession(1) // Tarde session

      expect(store.activeExercises.length).toBe(2)
      expect(store.activeExerciseIndex).toBe(0)

      const advanced = store.nextExercise()
      expect(advanced).toBe(true)
      expect(store.activeExerciseIndex).toBe(1)
    })

    it('nextExercise returns false at last exercise', () => {
      const store = useRoutinesStore()
      store.selectProgram('foundations')

      // Week 1 has only 1 exercise per session
      const advanced = store.nextExercise()
      expect(advanced).toBe(false)
    })
  })

  describe('activeRoutineConfig', () => {
    it('returns timer-compatible config', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')

      const config = store.activeRoutineConfig
      expect(config).toHaveProperty('name')
      expect(config).toHaveProperty('exerciseId')
      expect(config).toHaveProperty('exerciseName')
      expect(config).toHaveProperty('reps')
      expect(config).toHaveProperty('contractSeconds')
      expect(config).toHaveProperty('restSeconds')
      expect(config).toHaveProperty('reverseSeconds')
      expect(config).toHaveProperty('type')
      expect(config).toHaveProperty('levels')
      expect(config).toHaveProperty('prepareSeconds')
      expect(config.name).toContain('Control eyaculatorio')
    })

    it('sets reverseSeconds for reverse_kegel exercises', () => {
      const store = useRoutinesStore()
      store.selectProgram('ejaculation_control')

      // Week 1, Tarde session has reverse_kegel
      store.setActiveSession(1)
      const config = store.activeRoutineConfig
      expect(config.exerciseId).toBe('reverse_kegel')
      expect(config.reverseSeconds).toBeGreaterThan(0)
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

  describe('legacy migration', () => {
    it('migrates old "control" program to "ejaculation_control"', () => {
      localStorage.setItem('keguel_program', 'control')
      localStorage.setItem('keguel_week', '5')

      setActivePinia(createPinia())
      const store = useRoutinesStore()

      expect(store.selectedProgramId).toBe('ejaculation_control')
      expect(store.currentWeek).toBe(5) // fits within 12 weeks
      expect(localStorage.getItem('keguel_data_version')).toBe('2')
    })

    it('migrates old "erection" program to "sexual_performance"', () => {
      localStorage.setItem('keguel_program', 'erection')
      localStorage.setItem('keguel_week', '3')

      setActivePinia(createPinia())
      const store = useRoutinesStore()

      expect(store.selectedProgramId).toBe('sexual_performance')
      expect(store.currentWeek).toBe(3)
    })

    it('migrates old "intensity" program to "sexual_performance"', () => {
      localStorage.setItem('keguel_program', 'intensity')
      localStorage.setItem('keguel_week', '10')

      setActivePinia(createPinia())
      const store = useRoutinesStore()

      expect(store.selectedProgramId).toBe('sexual_performance')
    })

    it('caps week if it exceeds new program totalWeeks', () => {
      localStorage.setItem('keguel_program', 'control')
      localStorage.setItem('keguel_week', '15') // over 12

      setActivePinia(createPinia())
      const store = useRoutinesStore()

      expect(store.currentWeek).toBe(12)
    })

    it('does not re-migrate if version is already 2', () => {
      localStorage.setItem('keguel_program', 'foundations')
      localStorage.setItem('keguel_week', '2')
      localStorage.setItem('keguel_data_version', '2')

      setActivePinia(createPinia())
      const store = useRoutinesStore()

      expect(store.selectedProgramId).toBe('foundations')
    })
  })
})
