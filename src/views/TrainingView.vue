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
              <div v-if="activePhase" class="bg-tertiary/5 rounded-xl p-4 border-l-2 border-tertiary flex gap-3">
                <span class="material-symbols-outlined text-tertiary text-base flex-shrink-0">tips_and_updates</span>
                <p class="text-xs leading-relaxed text-on-surface-variant">{{ activePhase.tip }}</p>
              </div>

              <!-- Imagen / visual -->
              <div class="w-full aspect-[16/10] bg-surface-container-low rounded-2xl flex items-center justify-center overflow-hidden relative">
                <div class="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                <!-- Placeholder visual con icono -->
                <div class="flex flex-col items-center gap-3 text-primary/30">
                  <span class="material-symbols-outlined text-7xl">self_improvement</span>
                </div>
                <div class="absolute bottom-4 right-4">
                  <div class="bg-surface/80 bg-glass px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm text-primary">timer</span>
                    <span class="text-xs font-bold text-primary">{{ totalMinutes }} {{ $t('training.min') }}</span>
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
                    {{ routine.reps }} × {{ routine.contractSeconds }}s
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
                @click="startSession"
                class="w-full bg-gradient-to-br from-primary to-primary-container text-white
                       py-5 rounded-xl font-headline font-bold text-lg shadow-lg
                       active:scale-[0.98] transition-all hover:shadow-primary/20"
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
                  :style="{ height: active ? `${50 + Math.random() * 50}%` : '25%',
                             opacity: active ? 1 : 1 }"
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

          <!-- Botón privacidad (esquina superior derecha) -->
          <button
            @click="privacyMode = !privacyMode"
            :aria-label="privacyMode ? 'Desactivar modo discreto' : 'Activar modo discreto'"
            class="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full
                   text-outline-variant/40 hover:text-primary transition-colors"
          >
            <span class="material-symbols-outlined text-lg" aria-hidden="true">
              {{ privacyMode ? 'visibility' : 'visibility_off' }}
            </span>
          </button>

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

              <!-- Orbe central (cristal) — clip-path fuerza el círculo -->
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
                  <div class="mt-4 flex flex-col items-center">
                    <span class="text-xs font-bold text-primary/50 uppercase tracking-[0.3em] mb-1">{{ $t('training.seconds') }}</span>
                    <span class="font-headline font-black text-5xl text-primary leading-none" aria-live="off" :aria-label="`${session.phaseTimeLeft} segundos restantes`">
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
              :aria-label="session.isPaused ? 'Continuar sesión' : 'Pausar sesión'"
              class="flex items-center justify-center gap-3 bg-primary text-white
                     px-10 py-4 rounded-full shadow-lg shadow-primary/20
                     hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span class="material-symbols-outlined text-2xl" aria-hidden="true">{{ session.isPaused ? 'play_arrow' : 'pause' }}</span>
              <span class="font-label font-bold uppercase tracking-widest text-sm">
                {{ session.isPaused ? $t('training.continue') : $t('training.pause') }}
              </span>
            </button>
            <button
              @click="confirmStop"
              :disabled="!session.isPaused"
              aria-label="Abandonar sesión"
              class="flex items-center justify-center gap-2 text-error/70 hover:text-error
                     active:scale-95 transition-all duration-300 py-2"
              :class="session.isPaused ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >
              <span class="material-symbols-outlined text-lg" aria-hidden="true">logout</span>
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
              <!-- Indicador mínimo: solo un punto que cambia de color según la fase -->
              <div
                class="w-4 h-4 rounded-full transition-colors duration-700 animate-pulse"
                :class="{
                  'bg-violet-400':  phase === 'ready',
                  'bg-sky-400':     phase === 'contract',
                  'bg-emerald-400': phase === 'rest',
                  'bg-orange-400':  phase === 'reverse',
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
import { useRoutinesStore, PROGRAMS } from '@/stores/routines'
import { useSoundService } from '@/stores/sound'
import { useHapticsService } from '@/stores/haptics'
import { useProfileStore } from '@/stores/profile'

const router   = useRouter()
const { t }    = useI18n()
const session  = useSessionStore()
const routines = useRoutinesStore()
const profile  = useProfileStore()
const sound    = useSoundService()
const haptics  = useHapticsService()

const sessionStarted = ref(false)
const privacyMode    = ref(false)

// storeToRefs garantiza reactividad entre vistas
const { selectedProgram: activeProgram, currentWeek, activePhase } = storeToRefs(routines)
const hasProgram = computed(() => !!activeProgram.value)

// Configuración del timer — reconstruida desde refs primitivos del store
const routine = computed(() => {
  const phase = activePhase.value
  if (!phase) return {
    name: t('training.freeSession'), reps: 10, contractSeconds: 5,
    restSeconds: 5, reverseSeconds: 0, type: 'slow',
  }
  const set = phase.sets[routines.activeSetIndex] ?? phase.sets[0]
  if (!set) return {
    name: t('training.freeSession'), reps: 10, contractSeconds: 5,
    restSeconds: 5, reverseSeconds: 0, type: 'slow',
  }
  return {
    name:            `${activeProgram.value.name} · Semana ${currentWeek.value}`,
    reps:            set.reps,
    contractSeconds: set.contractSeconds,
    restSeconds:     set.restSeconds,
    reverseSeconds:  set.reverseSeconds ?? 0,
    type:            set.type,
  }
})

// Intensidad visual 1-3
const intensityLevel = computed(() => {
  const reps = routine.value.reps
  if (reps <= 8)  return 1
  if (reps <= 12) return 2
  return 3
})

const routineLevel = computed(() => {
  if (!activeProgram.value) return t('training.freeSession')
  return `${t('training.week')} ${currentWeek.value} · ${activePhase.value?.name ?? ''}`
})

const totalMinutes = computed(() => {
  const r = routine.value
  const repDur = r.contractSeconds + r.restSeconds + (r.reverseSeconds ? r.reverseSeconds + r.restSeconds : 0)
  return Math.ceil(r.reps * repDur / 60)
})

// Timer
const phase      = computed(() => session.phase)
const phaseLabel = computed(() => ({
  ready:    t('phases.ready'),
  contract: t('phases.contract'),
  rest:     t('phases.rest'),
  reverse:  t('phases.reverse'),
}[phase.value] ?? t('phases.ready')))

const phaseSubtext = computed(() => ({
  ready:    '',
  contract: t('phases.contractSub'),
  rest:     t('phases.restSub'),
  reverse:  t('phases.reverseSub'),
}[phase.value] ?? ''))

// Colores del aura según fase
// contract → azul (sky) | rest → verde (emerald) | reverse → naranja
const auraColor = computed(() => {
  const map = {
    ready: {
      blob:     'bg-violet-400/30',
      ripple:   'border-violet-500/20',
      dot:      'bg-violet-500',
      subtext:  'text-violet-900',
      progress: 'bg-gradient-to-r from-violet-400 to-violet-600',
    },
    contract: {
      blob:     'bg-sky-400/30',
      ripple:   'border-sky-500/20',
      dot:      'bg-sky-500',
      subtext:  'text-sky-900',
      progress: 'bg-gradient-to-r from-sky-400 to-sky-600',
    },
    rest: {
      blob:     'bg-emerald-400/30',
      ripple:   'border-emerald-500/20',
      dot:      'bg-emerald-500',
      subtext:  'text-emerald-900',
      progress: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
    },
    reverse: {
      blob:     'bg-orange-400/30',
      ripple:   'border-orange-500/20',
      dot:      'bg-orange-500',
      subtext:  'text-orange-900',
      progress: 'bg-gradient-to-r from-orange-400 to-orange-500',
    },
  }
  return map[phase.value] ?? map.rest
})

// Tiempo elapsed formateado MM:SS
const elapsedFormatted = computed(() => {
  const t = session.elapsedTime
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const circumference = 2 * Math.PI * 88
const phaseDuration = computed(() => {
  const r = routine.value
  if (phase.value === 'contract') return r.contractSeconds
  if (phase.value === 'reverse')  return r.reverseSeconds
  return r.restSeconds
})
const dashOffset = computed(() => {
  const progress = session.phaseTimeLeft / (phaseDuration.value || 1)
  return circumference * (1 - progress)
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

function startSession() {
  session.startSession(routine.value)
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

// Navegar al resumen al completar — desactiva privacidad
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
/* ── Transición entre estados ── */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-leave-to   { opacity: 0; transform: translateY(-10px); }

/* ── Aura: respiración lenta ── */
@keyframes aura-breath {
  0%, 100% { transform: scale(1);    opacity: 0.6; filter: blur(40px); }
  50%       { transform: scale(1.15); opacity: 0.9; filter: blur(60px); }
}
.animate-aura {
  animation: aura-breath 6s ease-in-out infinite;
}

/* ── Ripples expansivos ── */
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

/* ── Orbe circular ── */
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

/* ── Modo privacidad ── */
.privacy-enter-active,
.privacy-leave-active {
  transition: opacity 0.3s ease;
}
.privacy-enter-from,
.privacy-leave-to {
  opacity: 0;
}
</style>
