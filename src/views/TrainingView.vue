<template>
  <div class="min-h-dvh bg-background text-on-background pt-safe">

    <!-- ═══════════════════════════════════════
         ESTADO 1: DASHBOARD "TODAY"
    ════════════════════════════════════════ -->
    <Transition name="slide-up">
      <div v-if="!sessionStarted" class="pb-12">

        <!-- TopAppBar -->
        <header class="fixed top-0 w-full z-50 bg-[#f4faff]/80 dark:bg-[#111d23]/80 bg-glass-light bg-glass">
          <div class="flex justify-between items-center px-6 h-16 w-full max-w-lg mx-auto">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
                <span class="material-symbols-outlined text-primary text-base" style="font-variation-settings: 'FILL' 1">person</span>
              </div>
              <div class="flex flex-col">
                <span class="text-primary font-headline font-extrabold tracking-tighter text-xl leading-tight">PelvicForce</span>
                <span class="text-on-surface-variant font-label text-[10px] tracking-wide">{{ $t('training.hello', { name: profile.name }) }}</span>
              </div>
            </div>
            <RouterLink to="/profile" aria-label="Ajustes">
              <button class="text-primary p-2 hover:bg-surface-container-high transition-colors active:scale-95 duration-200 rounded-xl" aria-label="Abrir ajustes">
                <span class="material-symbols-outlined" aria-hidden="true">settings</span>
              </button>
            </RouterLink>
          </div>
        </header>

        <main class="pt-24 px-6 max-w-lg mx-auto space-y-10">

          <!-- Safety alerts -->
          <div v-if="safety.painReported" class="bg-error/10 rounded-2xl p-5 border-l-4 border-error space-y-3">
            <div class="flex gap-3 items-start">
              <span class="material-symbols-outlined text-error">warning</span>
              <div class="space-y-1">
                <p class="font-headline font-bold text-sm text-error">{{ $t('safety.painAlertTitle') }}</p>
                <p class="text-xs text-error/80 leading-relaxed">{{ $t('safety.painAlertBody') }}</p>
              </div>
            </div>
            <button @click="safety.clearPainAlert()" class="text-xs font-bold text-error underline">
              {{ $t('safety.clearPain') }}
            </button>
          </div>

          <div v-if="showOverdoingAlert" class="bg-orange-500/10 rounded-2xl p-4 border-l-4 border-orange-500 flex gap-3 items-start">
            <span class="material-symbols-outlined text-orange-500 text-sm mt-0.5">info</span>
            <p class="text-xs text-orange-700 leading-relaxed">{{ $t('training.overdoingWarning') }}</p>
          </div>

          <div v-if="showDailyLimitAlert" class="bg-error/10 rounded-2xl p-4 border-l-4 border-error flex gap-3 items-start">
            <span class="material-symbols-outlined text-error text-sm mt-0.5">block</span>
            <p class="text-xs text-error leading-relaxed">{{ $t('training.dailyLimitReached') }}</p>
          </div>

          <!-- Hero editorial -->
          <section class="flex flex-col gap-1">
            <span class="text-secondary font-label text-xs uppercase tracking-widest font-semibold">
              {{ hasProgram ? activeProgram.name : $t('training.noProgram') }}
            </span>
            <h1 class="font-headline font-extrabold text-4xl text-primary tracking-tight leading-tight">
              {{ hasProgram ? activePhase?.name ?? $t('training.readyToTrain') : $t('training.chooseProgram') }}
            </h1>
          </section>

          <!-- Tarjeta principal bento -->
          <section class="relative group">
            <div class="absolute inset-0 bg-primary opacity-[0.03] rounded-3xl -rotate-1 scale-[1.02] transition-transform group-hover:rotate-0" />
            <div class="relative bg-surface-container-lowest rounded-3xl p-8 shadow-[0_32px_32px_-4px_rgba(17,29,35,0.06)] space-y-8">

              <!-- Header tarjeta -->
              <div class="flex justify-between items-start">
                <div class="space-y-1">
                  <h2 class="font-headline font-bold text-2xl text-primary">
                    {{ activeProgram ? activeProgram.name : $t('training.pelvicActivation') }}
                  </h2>
                  <p class="text-on-surface-variant text-sm">
                    {{ activePhase ? activePhase.name : $t('training.noActiveProgram') }}
                  </p>
                </div>
                <div class="bg-tertiary-fixed-dim/20 text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {{ routineLevel }}
                </div>
              </div>

              <!-- Tip de la fase si hay programa -->
              <div v-if="activePhase?.tip" class="bg-tertiary/5 rounded-xl p-4 border-l-2 border-tertiary flex gap-3">
                <span class="material-symbols-outlined text-tertiary text-base flex-shrink-0">tips_and_updates</span>
                <p class="text-xs leading-relaxed text-on-surface-variant">{{ activePhase.tip }}</p>
              </div>

              <!-- Session selector (morning/afternoon/evening) -->
              <div v-if="hasProgram && todaySessions.length > 1" class="flex gap-2">
                <button
                  v-for="(s, i) in todaySessions"
                  :key="s.id"
                  @click="routines.setActiveSession(i)"
                  class="flex-1 py-2 px-3 rounded-xl text-xs font-label font-bold transition-all active:scale-95"
                  :class="routines.activeSessionIndex === i
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-high text-on-surface-variant'"
                >
                  {{ s.label }}
                </button>
              </div>

              <!-- Exercise list preview -->
              <div v-if="hasProgram && currentExercises.length > 0" class="space-y-2">
                <div
                  v-for="(ex, i) in currentExercises"
                  :key="i"
                  @click="routines.setActiveExercise(i)"
                  class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
                  :class="routines.activeExerciseIndex === i
                    ? 'bg-primary/10 ring-1 ring-primary/30'
                    : 'bg-surface-container'"
                >
                  <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="routines.activeExerciseIndex === i ? 'bg-primary text-white' : 'bg-surface-container-high text-secondary'">
                    <span class="material-symbols-outlined text-sm">{{ exerciseIcon(ex.exerciseId) }}</span>
                  </div>
                  <div class="flex-grow">
                    <p class="font-label font-bold text-xs" :class="routines.activeExerciseIndex === i ? 'text-primary' : 'text-on-surface'">
                      {{ $t(`exerciseTypes.${ex.exerciseId}`) }}
                    </p>
                    <p class="text-[10px] text-on-surface-variant">
                      {{ ex.reps }} reps · {{ ex.contractSeconds }}s
                    </p>
                  </div>
                </div>
              </div>

              <!-- Stats grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-surface-container-high rounded-2xl p-4 flex flex-col gap-1">
                  <span class="text-[10px] text-on-secondary-container uppercase tracking-wider font-semibold">{{ $t('training.intensity') }}</span>
                  <div class="flex gap-1 mt-1">
                    <div
                      v-for="i in 3" :key="i"
                      class="h-1.5 w-6 rounded-full"
                      :class="i <= intensityLevel ? 'bg-primary' : 'bg-outline-variant/30'"
                    />
                  </div>
                </div>
                <div class="bg-surface-container-high rounded-2xl p-4 flex flex-col gap-1">
                  <span class="text-[10px] text-on-secondary-container uppercase tracking-wider font-semibold">{{ $t('training.reps') }}</span>
                  <span class="text-lg font-headline font-bold text-primary">
                    {{ routine?.reps ?? 10 }} × {{ routine?.contractSeconds ?? 5 }}s
                  </span>
                </div>
              </div>

              <!-- Ir a programa -->
              <RouterLink to="/program">
                <button class="w-full flex items-center justify-between px-4 py-3 rounded-xl
                               bg-surface-container text-on-surface-variant text-sm font-label
                               active:scale-[0.98] transition-transform mb-1">
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">{{ hasProgram ? 'route' : 'add_circle' }}</span>
                    {{ hasProgram ? $t('training.viewFullProgram') : $t('training.chooseAProgram') }}
                  </span>
                  <span class="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </RouterLink>

              <!-- CTA principal -->
              <button
                @click="handleStartSession"
                :disabled="!canStart"
                class="w-full py-5 rounded-xl font-headline font-bold text-lg shadow-lg
                       active:scale-[0.98] transition-all"
                :class="canStart
                  ? 'bg-gradient-to-br from-primary to-primary-container text-white hover:shadow-primary/20'
                  : 'bg-surface-container-high text-outline cursor-not-allowed'"
              >
                {{ $t('training.startSession') }}
              </button>
            </div>
          </section>

          <!-- Consistencia semanal -->
          <section class="space-y-4">
            <div class="flex justify-between items-end px-2">
              <h3 class="font-headline font-bold text-xl text-primary">{{ $t('training.consistency') }}</h3>
              <span class="text-xs text-on-surface-variant">{{ streakText }}</span>
            </div>
            <div class="bg-surface-container-low rounded-3xl p-6">
              <div class="flex gap-2.5 items-end h-16 w-full">
                <div
                  v-for="(active, i) in weekActivity"
                  :key="i"
                  class="flex-1 rounded-full transition-all duration-700"
                  :class="active ? 'bg-primary' : 'bg-outline-variant/20'"
                  :style="{ height: active ? `${50 + Math.random() * 50}%` : '25%' }"
                />
              </div>
              <div class="flex justify-between mt-3 text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest px-0.5">
                <span v-for="(d, i) in dayLabels" :key="d" :class="i === todayIndex ? 'text-primary' : ''">{{ d }}</span>
              </div>
            </div>
          </section>

          <!-- Tip del día -->
          <section class="bg-tertiary/5 rounded-3xl p-6 border-l-4 border-tertiary">
            <div class="flex gap-4 items-start">
              <span class="material-symbols-outlined text-tertiary">spa</span>
              <div class="space-y-1">
                <h4 class="font-headline font-bold text-sm text-tertiary">{{ $t('training.recoveryTip') }}</h4>
                <p class="text-xs leading-relaxed text-on-surface-variant">
                  {{ $t('training.recoveryTipText') }}
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════
         ESTADO 2: TIMER CON AURA
    ════════════════════════════════════════ -->
    <Transition name="slide-up">
      <div v-if="sessionStarted" class="h-dvh flex flex-col bg-surface overflow-hidden">

        <main class="relative flex flex-col items-center justify-center px-6 pt-6 pb-24 h-full overflow-hidden">

          <!-- Botón privacidad -->
          <button
            @click="privacyMode = !privacyMode"
            class="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full
                   text-outline-variant/40 hover:text-primary transition-colors"
          >
            <span class="material-symbols-outlined text-lg">
              {{ privacyMode ? 'visibility' : 'visibility_off' }}
            </span>
          </button>

          <!-- Multi-exercise progress -->
          <div v-if="session.totalExercisesInQueue > 1" class="absolute top-4 left-4 z-20">
            <span class="text-xs font-label font-bold text-outline-variant/60">
              {{ $t('training.exerciseOf', { current: session.currentExerciseIndex + 1, total: session.totalExercisesInQueue }) }}
            </span>
          </div>

          <!-- ─── AURA CENTRAL ─── -->
          <div class="relative z-10 flex flex-col items-center justify-center w-full max-w-lg aspect-square">
            <div class="absolute inset-0 flex items-center justify-center">

              <!-- Aura exterior difuminada -->
              <div
                class="absolute w-96 h-96 rounded-full blur-3xl animate-aura transition-colors duration-700"
                :class="auraColor.blob"
              />

              <!-- Ripples -->
              <div
                class="absolute w-80 h-80 rounded-full border-2 animate-ripple transition-colors duration-700"
                :class="auraColor.ripple"
              />
              <div
                class="absolute w-80 h-80 rounded-full border-2 animate-ripple-delayed transition-colors duration-700"
                :class="auraColor.ripple"
              />

              <!-- Orbe central -->
              <div class="orb-circle transition-all duration-700">
                <div class="orb-content">
                  <p class="text-primary font-headline text-4xl font-extrabold tracking-tight mb-1" aria-live="polite">
                    {{ phaseLabel }}
                  </p>
                  <div class="flex items-center justify-center gap-2">
                    <span
                      class="w-2.5 h-2.5 rounded-full animate-pulse transition-colors duration-700"
                      :class="auraColor.dot"
                    />
                    <p class="font-label text-sm font-bold tracking-widest uppercase"
                       :class="auraColor.subtext">
                      {{ phaseSubtext }}
                    </p>
                  </div>

                  <!-- Level indicator for elevator/isometric -->
                  <div v-if="session.currentLevel !== null" class="mt-3 flex gap-1.5">
                    <div
                      v-for="l in (session.levels || 4)" :key="l"
                      class="w-3 h-3 rounded-full transition-all duration-300"
                      :class="l <= session.currentLevel ? 'bg-primary scale-110' : 'bg-outline-variant/30'"
                    />
                  </div>

                  <div class="mt-4 flex flex-col items-center">
                    <span class="text-xs font-bold text-primary/50 uppercase tracking-[0.3em] mb-1">{{ $t('training.seconds') }}</span>
                    <span class="font-headline font-black text-5xl text-primary leading-none">
                      {{ session.phaseTimeLeft }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Controles -->
          <div class="mt-8 z-10 flex flex-col items-center gap-4">
            <button
              @click="togglePause"
              class="flex items-center justify-center gap-3 bg-primary text-white
                     px-10 py-4 rounded-full shadow-lg shadow-primary/20
                     hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span class="material-symbols-outlined text-2xl">{{ session.isPaused ? 'play_arrow' : 'pause' }}</span>
              <span class="font-label font-bold uppercase tracking-widest text-sm">
                {{ session.isPaused ? $t('training.continue') : $t('training.pause') }}
              </span>
            </button>
            <button
              @click="confirmStop"
              :disabled="!session.isPaused"
              class="flex items-center justify-center gap-2 text-error/70 hover:text-error
                     active:scale-95 transition-all duration-300 py-2"
              :class="session.isPaused ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >
              <span class="material-symbols-outlined text-lg">logout</span>
              <span class="font-label font-bold uppercase tracking-widest text-xs">
                {{ $t('training.stop') }}
              </span>
            </button>
          </div>

          <!-- ─── OVERLAY MODO PRIVACIDAD ─── -->
          <Transition name="privacy">
            <div
              v-if="privacyMode"
              @click="privacyMode = false"
              class="fixed inset-0 z-[60] bg-on-surface flex flex-col items-center justify-center cursor-pointer select-none"
            >
              <div
                class="w-4 h-4 rounded-full transition-colors duration-700 animate-pulse"
                :class="{
                  'bg-violet-400':  phase === 'ready',
                  'bg-sky-400':     phase === 'contract',
                  'bg-emerald-400': phase === 'rest',
                  'bg-orange-400':  phase === 'reverse',
                  'bg-amber-400':   phase === 'prepare',
                  'bg-indigo-400':  phase === 'descend',
                }"
              />
              <p class="text-white/10 text-xs mt-6 font-label uppercase tracking-widest">
                {{ $t('training.tapToReturn') }}
              </p>
            </div>
          </Transition>

        </main>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/stores/session'
import { useRoutinesStore, PROGRAMS, EXERCISES } from '@/stores/routines'
import { useSafetyStore } from '@/stores/safety'
import { useSoundService } from '@/stores/sound'
import { useHapticsService } from '@/stores/haptics'
import { useProfileStore } from '@/stores/profile'

const router   = useRouter()
const { t }    = useI18n()
const session  = useSessionStore()
const routines = useRoutinesStore()
const safety   = useSafetyStore()
const profile  = useProfileStore()
const sound    = useSoundService()
const haptics  = useHapticsService()

const sessionStarted = ref(false)
const privacyMode    = ref(false)

const { selectedProgram: activeProgram, currentWeek, activePhase, todaySessions, activeExercises: currentExercises } = storeToRefs(routines)
const hasProgram = computed(() => !!activeProgram.value)

// Safety checks
const showOverdoingAlert = computed(() => !safety.painReported && safety.isOverdoing(session.history))
const showDailyLimitAlert = computed(() => !safety.painReported && safety.dailyLimitReached(session.history))
const canStart = computed(() => safety.canStartSession(session.history))

// Routine config from active exercise
const routine = computed(() => routines.activeRoutineConfig)

// Exercise icons from catalog
const EXERCISE_ICONS = Object.fromEntries(EXERCISES.map(e => [e.id, e.iconKey]))
function exerciseIcon(exerciseId) {
  return EXERCISE_ICONS[exerciseId] ?? 'fitness_center'
}

// Intensidad visual 1-3
const intensityLevel = computed(() => {
  const reps = routine.value?.reps ?? 10
  if (reps <= 8)  return 1
  if (reps <= 12) return 2
  return 3
})

const routineLevel = computed(() => {
  if (!activeProgram.value) return t('training.freeSession')
  return `${t('training.week')} ${currentWeek.value} · ${activePhase.value?.name ?? ''}`
})

// Timer phases
const phase      = computed(() => session.phase)
const phaseLabel = computed(() => ({
  ready:    t('phases.ready'),
  contract: t('phases.contract'),
  rest:     t('phases.rest'),
  reverse:  t('phases.reverse'),
  prepare:  t('phases.prepare'),
  descend:  t('phases.descend'),
}[phase.value] ?? t('phases.ready')))

const phaseSubtext = computed(() => ({
  ready:    '',
  contract: t('phases.contractSub'),
  rest:     t('phases.restSub'),
  reverse:  t('phases.reverseSub'),
  prepare:  t('phases.prepareSub'),
  descend:  t('phases.descendSub'),
}[phase.value] ?? ''))

// Colores del aura según fase
const auraColor = computed(() => {
  const map = {
    ready: {
      blob: 'bg-violet-400/30', ripple: 'border-violet-500/20',
      dot: 'bg-violet-500', subtext: 'text-violet-900',
    },
    contract: {
      blob: 'bg-sky-400/30', ripple: 'border-sky-500/20',
      dot: 'bg-sky-500', subtext: 'text-sky-900',
    },
    rest: {
      blob: 'bg-emerald-400/30', ripple: 'border-emerald-500/20',
      dot: 'bg-emerald-500', subtext: 'text-emerald-900',
    },
    reverse: {
      blob: 'bg-orange-400/30', ripple: 'border-orange-500/20',
      dot: 'bg-orange-500', subtext: 'text-orange-900',
    },
    prepare: {
      blob: 'bg-amber-400/30', ripple: 'border-amber-500/20',
      dot: 'bg-amber-500', subtext: 'text-amber-900',
    },
    descend: {
      blob: 'bg-indigo-400/30', ripple: 'border-indigo-500/20',
      dot: 'bg-indigo-500', subtext: 'text-indigo-900',
    },
  }
  return map[phase.value] ?? map.rest
})

// Consistencia
const weekActivity = computed(() => session.weekActivity)
const dayKeys      = ['days.mon', 'days.tue', 'days.wed', 'days.thu', 'days.fri', 'days.sat', 'days.sun']
const dayLabels    = computed(() => dayKeys.map(k => t(k)))
const todayIndex   = computed(() => (new Date().getDay() + 6) % 7)
const weekCount    = computed(() => weekActivity.value.filter(Boolean).length)
const streakText   = computed(() => {
  const n = weekCount.value
  return n === 0 ? t('training.noStreakYet') : t('training.daysThisWeek', { n }, n)
})

function handleStartSession() {
  if (!canStart.value) return
  const config = routine.value
  if (!config) return

  // Build exercise queue from current session's exercises
  const queue = currentExercises.value.map(ex => {
    const meta = EXERCISES.find(e => e.id === ex.exerciseId)
    return {
      name:            `${activeProgram.value?.name ?? ''} · Semana ${currentWeek.value}`,
      exerciseId:      ex.exerciseId,
      exerciseName:    meta?.name ?? ex.exerciseId,
      reps:            ex.reps,
      contractSeconds: ex.contractSeconds,
      restSeconds:     ex.relaxSeconds,
      reverseSeconds:  ex.exerciseId === 'reverse_kegel' ? ex.contractSeconds : 0,
      levels:          ex.levels ?? 0,
      prepareSeconds:  ex.prepareSeconds ?? 0,
      type:            ex.exerciseId,
    }
  })

  const startConfig = queue[routines.activeExerciseIndex] ?? queue[0] ?? config
  session.startSession(startConfig, queue)
  sessionStarted.value = true
}

function togglePause() {
  session.isPaused ? session.resumeSession() : session.pauseSession()
}

function confirmStop() {
  session.stopSession()
  sessionStarted.value = false
}

// Feedback sonoro + háptico en cambios de fase
watch(phase, (newPhase) => {
  if (session.isActive && !session.isPaused) {
    sound.playPhaseChange(newPhase)
    haptics.phaseChange(newPhase)
  }
})

// Tick en los últimos 3 segundos de cada fase
watch(() => session.phaseTimeLeft, (t) => {
  if (session.isActive && !session.isPaused && t > 0 && t <= 3) {
    sound.playTick()
    haptics.tick()
  }
})

// Navegar al resumen al completar
watch(() => session.isActive, (active, wasActive) => {
  if (wasActive && !active && session.lastSession) {
    privacyMode.value = false
    sound.playComplete()
    haptics.complete()
    sessionStarted.value = false
    router.push('/summary')
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-leave-to   { opacity: 0; transform: translateY(-10px); }

@keyframes aura-breath {
  0%, 100% { transform: scale(1);    opacity: 0.6; filter: blur(40px); }
  50%       { transform: scale(1.15); opacity: 0.9; filter: blur(60px); }
}
.animate-aura {
  animation: aura-breath 6s ease-in-out infinite;
}

@keyframes ripple {
  0%   { transform: scale(0.8); opacity: 0; }
  50%  { opacity: 0.3; }
  100% { transform: scale(1.4); opacity: 0; }
}
.animate-ripple {
  animation: ripple 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}
.animate-ripple-delayed {
  animation: ripple 3s cubic-bezier(0, 0, 0.2, 1) infinite;
  animation-delay: 1.5s;
}

.orb-circle {
  position: relative;
  width: 20rem;
  height: 20rem;
  border-radius: 50%;
  clip-path: circle(50%);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}
.orb-content {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.privacy-enter-active,
.privacy-leave-active {
  transition: opacity 0.3s ease;
}
.privacy-enter-from,
.privacy-leave-to {
  opacity: 0;
}
</style>
