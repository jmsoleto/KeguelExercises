<template>
  <div class="min-h-dvh bg-background pb-12">

    <!-- TopBar con botón volver -->
    <header class="flex items-center gap-3 px-4 py-4 pt-safe sticky top-0 z-40 bg-background bg-glass">
      <button @click="router.back()" class="text-primary p-2 rounded-xl active:scale-95 transition-transform">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="font-headline font-bold text-xl text-primary truncate">{{ program?.name }}</h1>
    </header>

    <main v-if="program" class="max-w-lg mx-auto px-6 pt-2 space-y-8">

      <!-- Hero del programa -->
      <section class="relative rounded-3xl overflow-hidden p-8 space-y-3"
        :style="{ background: `linear-gradient(135deg, ${program.accentColor}18 0%, ${program.accentColor}08 100%)` }"
      >
        <div class="flex items-start justify-between">
          <div>
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-3', program.colorClass]">
              <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1">
                {{ program.icon }}
              </span>
            </div>
            <h2 class="font-headline font-extrabold text-2xl text-primary">{{ program.name }}</h2>
            <p class="text-on-surface-variant text-sm mt-1">{{ program.tagline }}</p>
          </div>
          <div v-if="isCurrentProgram" :class="['px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider', program.colorClass]">
            {{ isIndefinite
              ? $t('program.weekOfIndefinite', { current: currentWeek })
              : $t('program.weekOf', { current: currentWeek, total: program.totalWeeks })
            }}
          </div>
        </div>

        <p class="text-on-surface-variant text-sm leading-relaxed pt-2">{{ program.description }}</p>

        <!-- Medical warning -->
        <div v-if="program.medicalWarning" class="bg-error/10 rounded-xl p-3 border-l-2 border-error flex gap-2 mt-2">
          <span class="material-symbols-outlined text-error text-sm flex-shrink-0 mt-0.5">warning</span>
          <p class="text-xs leading-relaxed text-error">{{ program.medicalWarning }}</p>
        </div>

        <div class="flex items-center gap-4 pt-2 text-xs text-outline">
          <span>{{ isIndefinite ? $t('program.ongoing') : $t('program.duration', { n: program.totalWeeks }) }}</span>
          <span>·</span>
          <span>{{ $t('program.perDay', { n: program.sessionsPerDay }) }}</span>
          <span>·</span>
          <span>{{ program.benefit }}</span>
        </div>

        <!-- Level badge -->
        <div class="pt-1">
          <span class="text-xs text-outline">{{ $t('program.level') }}: {{ $t(`levels.${program.level}`) }}</span>
        </div>

        <!-- Barra de progreso (solo si es el plan activo y finito) -->
        <div v-if="isCurrentProgram && !isIndefinite" class="space-y-2 pt-3">
          <div class="flex gap-1">
            <div
              v-for="w in program.totalWeeks" :key="w"
              class="flex-1 h-1.5 rounded-full transition-all duration-500"
              :class="w <= currentWeek ? 'bg-primary' : 'bg-surface-container-highest'"
            />
          </div>
          <p class="text-xs text-outline text-right">{{ weekProgressText }}</p>
        </div>

        <!-- Indicador para plan indefinido -->
        <div v-if="isCurrentProgram && isIndefinite" class="pt-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-sm">all_inclusive</span>
            <span class="text-xs text-outline">{{ $t('program.weekOfIndefinite', { current: currentWeek }) }}</span>
          </div>
        </div>

        <!-- Progresión semanal (solo si es el plan activo) -->
        <div v-if="isCurrentProgram" class="bg-surface-container-lowest rounded-xl p-4 mt-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-label text-on-surface-variant">
              {{ $t('program.sessionsThisWeek') }} <strong class="text-primary">{{ sessionsThisWeek }}/{{ routines.MIN_SESSIONS_TO_ADVANCE }}</strong>
            </span>
            <button
              v-if="!isProgramComplete"
              @click="handleAdvanceWeek"
              :disabled="!canAdvance"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-label font-bold transition-all active:scale-95"
              :class="canAdvance
                ? 'bg-primary text-white'
                : 'bg-surface-container-high text-outline cursor-not-allowed'"
            >
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
              {{ $t('program.advanceWeek') }}
            </button>
            <span v-else class="text-xs font-bold text-tertiary">{{ $t('program.completed') }}</span>
          </div>
          <transition name="slide">
            <p v-if="advanceMessage" class="text-xs text-tertiary font-semibold">{{ advanceMessage }}</p>
          </transition>
        </div>
      </section>

      <!-- Todas las fases / roadmap -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-xl text-primary">{{ $t('program.roadmap') }}</h3>
        <div class="space-y-3">
          <div
            v-for="(phase, i) in program.phases"
            :key="i"
            class="flex gap-4 items-start"
          >
            <!-- Timeline dot -->
            <div class="flex flex-col items-center pt-1 flex-shrink-0">
              <div
                class="w-4 h-4 rounded-full border-2 transition-colors"
                :class="isCurrentProgram && isPhaseCompleted(phase)
                  ? 'bg-primary border-primary'
                  : isCurrentProgram && isPhaseActive(phase)
                    ? 'bg-white border-primary ring-4 ring-primary/20'
                    : 'bg-surface-container-high border-outline-variant'"
              />
              <div v-if="i < program.phases.length - 1" class="w-px flex-1 min-h-[32px] bg-outline-variant/30 mt-1" />
            </div>
            <!-- Content -->
            <div
              class="flex-grow pb-4 transition-opacity"
              :class="isCurrentProgram && isPhaseCompleted(phase) ? 'opacity-50' : ''"
            >
              <div class="flex items-center justify-between mb-1">
                <p class="font-headline font-bold text-sm text-primary">{{ phase.name }}</p>
                <p class="text-xs text-outline">
                  {{ phase.weeks[1] === null
                    ? $t('program.weekRangeIndefinite', { from: phase.weeks[0] })
                    : $t('program.weekRange', { from: phase.weeks[0], to: phase.weeks[1] })
                  }}
                </p>
              </div>
              <p class="text-xs text-on-surface-variant leading-relaxed">{{ phase.description }}</p>

              <!-- Tip de la fase -->
              <div v-if="phase.tip" class="bg-tertiary/5 rounded-xl p-3 border-l-2 border-tertiary flex gap-2 mt-2">
                <span class="material-symbols-outlined text-tertiary text-sm flex-shrink-0 mt-0.5">tips_and_updates</span>
                <p class="text-xs leading-relaxed text-on-surface-variant">{{ phase.tip }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Ejercicios de la sesión actual (preview) -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-xl text-primary">{{ $t('program.sessionBlocks') }}</h3>
        <div class="bg-surface-container-lowest rounded-2xl p-6 space-y-3 shadow-sm">
          <p class="text-xs font-label uppercase tracking-widest text-outline mb-2">
            {{ isCurrentProgram ? activePhase?.name : program.phases[0].name }}
          </p>

          <!-- Sesiones del día -->
          <div v-for="session in previewSessions" :key="session.id" class="space-y-2">
            <p class="text-xs font-label font-bold text-secondary">{{ session.label }}</p>
            <div
              v-for="(ex, i) in session.exercises"
              :key="i"
              class="flex items-center gap-4 p-4 rounded-xl bg-surface-container"
            >
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-surface-container-high">
                <span class="material-symbols-outlined text-base text-secondary">{{ exerciseIcon(ex.exerciseId) }}</span>
              </div>
              <div class="flex-grow">
                <p class="font-label font-bold text-sm text-on-surface">{{ $t(`exerciseTypes.${ex.exerciseId}`) }}</p>
                <p class="text-xs text-on-surface-variant mt-0.5">
                  {{ ex.reps }} reps · {{ ex.contractSeconds }}s {{ $t('program.contract') }} · {{ ex.relaxSeconds }}s {{ $t('program.rest') }}
                  <span v-if="ex.levels"> · {{ ex.levels }} niveles</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA principal -->
      <section class="pb-8">
        <button
          v-if="!hasActiveProgram"
          @click="startProgram"
          class="w-full bg-gradient-to-br from-primary to-primary-container text-white
                 py-5 rounded-xl font-headline font-bold text-lg shadow-lg
                 active:scale-[0.98] transition-all"
        >
          {{ $t('program.startThisPlan') }}
        </button>

        <button
          v-else-if="isCurrentProgram"
          @click="showConfirm = true"
          class="w-full flex items-center justify-center gap-2 py-5 rounded-xl
                 border-2 border-error text-error font-headline font-bold text-lg
                 active:scale-[0.98] transition-all"
        >
          <span class="material-symbols-outlined text-xl">close</span>
          {{ $t('program.abandonPlan') }}
        </button>

        <button
          v-else
          @click="showConfirm = true"
          class="w-full bg-gradient-to-br from-primary to-primary-container text-white
                 py-5 rounded-xl font-headline font-bold text-lg shadow-lg
                 active:scale-[0.98] transition-all"
        >
          {{ $t('program.switchToPlan') }}
        </button>
      </section>

    </main>

    <!-- Modal de confirmación -->
    <Transition name="modal">
      <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-end justify-center">
        <div class="absolute inset-0 bg-on-surface/30 bg-glass" @click="showConfirm = false" />
        <div class="relative w-full max-w-lg bg-background rounded-t-2xl p-6 pb-safe shadow-2xl space-y-4"
          style="padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px))">
          <h3 class="font-headline font-bold text-lg text-on-surface">{{ confirmTitle }}</h3>
          <p class="text-on-surface-variant text-sm">{{ confirmBody }}</p>
          <div class="flex gap-3 pt-2">
            <button @click="showConfirm = false"
              class="flex-1 py-4 rounded-xl font-headline font-bold text-primary bg-surface-container active:scale-[0.98]">
              {{ $t('program.cancel') }}
            </button>
            <button @click="confirmAction"
              class="flex-1 py-4 rounded-xl font-headline font-bold text-white active:scale-[0.98]"
              :class="isCurrentProgram ? 'bg-error' : 'bg-primary'">
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRoutinesStore, PROGRAMS, EXERCISES } from '@/stores/routines'
import { useSessionStore } from '@/stores/session'

const route   = useRoute()
const router  = useRouter()
const { t }   = useI18n()
const routines = useRoutinesStore()
const session  = useSessionStore()

const showConfirm = ref(false)
const advanceMessage = ref('')

const { selectedProgramId, currentWeek, activePhase } = storeToRefs(routines)

const program = computed(() =>
  PROGRAMS.find(p => p.id === route.params.id) ?? null
)

const isIndefinite = computed(() => program.value?.totalWeeks === null)
const hasActiveProgram = computed(() => !!selectedProgramId.value)
const isCurrentProgram = computed(() =>
  selectedProgramId.value === route.params.id
)
const isProgramComplete = computed(() => {
  if (isIndefinite.value) return false
  return currentWeek.value >= (program.value?.totalWeeks ?? 12)
})

const sessionsThisWeek = computed(() => routines.weekSessionCount(session.history))
const canAdvance = computed(() =>
  sessionsThisWeek.value >= routines.MIN_SESSIONS_TO_ADVANCE && !isProgramComplete.value
)

const weekProgressText = computed(() => {
  if (isIndefinite.value) return ''
  const remaining = program.value.totalWeeks - currentWeek.value
  return remaining === 0 ? t('program.programComplete') : t('program.weeksRemaining', { n: remaining })
})

// Preview: sesiones de la fase activa o primera fase
const previewSessions = computed(() => {
  const phase = isCurrentProgram.value ? activePhase.value : program.value?.phases[0]
  if (!phase?.weeklySchedule?.length) return []
  return phase.weeklySchedule[0].sessions ?? []
})

function handleAdvanceWeek() {
  const result = routines.tryAdvanceWeek(session.history)
  if (result.advanced) {
    advanceMessage.value = t('program.advancedTo', { week: currentWeek.value })
    setTimeout(() => { advanceMessage.value = '' }, 3000)
  }
}

function isPhaseActive(phase) {
  if (phase.weeks[1] === null) return currentWeek.value >= phase.weeks[0]
  return currentWeek.value >= phase.weeks[0] && currentWeek.value <= phase.weeks[1]
}
function isPhaseCompleted(phase) {
  if (phase.weeks[1] === null) return false
  return currentWeek.value > phase.weeks[1]
}

const EXERCISE_ICONS = Object.fromEntries(EXERCISES.map(e => [e.id, e.iconKey]))
function exerciseIcon(exerciseId) {
  return EXERCISE_ICONS[exerciseId] ?? 'fitness_center'
}

function startProgram() {
  routines.selectProgram(route.params.id)
  router.push('/training')
}

const confirmTitle = computed(() =>
  isCurrentProgram.value
    ? t('program.confirmAbandonTitle')
    : t('program.confirmSwitchTitle')
)
const confirmBody = computed(() =>
  isCurrentProgram.value
    ? t('program.confirmAbandonBody', { week: currentWeek.value })
    : t('program.confirmSwitchBody', { from: routines.selectedProgram?.name, to: program.value?.name })
)
const confirmButtonText = computed(() =>
  isCurrentProgram.value
    ? t('program.yesAbandon')
    : t('program.yesSwitch')
)

function confirmAction() {
  if (isCurrentProgram.value) {
    routines.resetProgram()
  } else {
    routines.selectProgram(route.params.id)
  }
  showConfirm.value = false
  router.push('/training')
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
