<template>
  <div class="min-h-dvh flex flex-col bg-background">
    <!-- TopBar -->
    <header class="flex items-center justify-between px-6 py-4 pt-safe sticky top-0 z-40 bg-background bg-glass">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          aria-label="Cerrar"
          class="material-symbols-outlined text-primary hover:bg-surface-container-low
                 transition-colors rounded-full p-2 active:scale-95 duration-200"
        >close</button>
        <h1 class="font-headline font-bold text-xl text-primary">{{ $t('summary.title') }}</h1>
      </div>
      <div class="w-10" />
    </header>

    <main class="flex-grow px-6 pt-8 pb-32 max-w-2xl mx-auto w-full">

      <!-- Hero -->
      <section class="mb-12 text-center">
        <div class="inline-flex items-center justify-center p-3 bg-tertiary-fixed text-on-tertiary-fixed rounded-full mb-6">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">check_circle</span>
        </div>
        <h2 class="font-headline font-extrabold text-4xl text-primary tracking-tight mb-2">
          {{ $t('summary.completed') }}
        </h2>
        <p class="text-on-surface-variant text-lg">
          {{ $t('summary.subtitle') }}
        </p>
      </section>

      <!-- Multi-exercise progress -->
      <div v-if="session.totalExercisesInQueue > 1" class="bg-primary/10 rounded-2xl p-4 mb-8 text-center">
        <p class="text-sm font-label font-bold text-primary">
          {{ $t('summary.dailyProgress', { done: session.currentExerciseIndex + 1, total: session.totalExercisesInQueue }) }}
        </p>
      </div>

      <!-- Stats Bento Grid -->
      <div class="grid grid-cols-3 gap-4 mb-12">
        <div class="bg-surface-container-lowest rounded-xl p-5 flex flex-col justify-between min-h-[120px] shadow-sm">
          <span class="text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-semibold">{{ $t('summary.duration') }}</span>
          <div class="mt-3 flex items-baseline gap-1">
            <span class="text-3xl font-headline font-bold text-primary">{{ durationMin }}</span>
            <span class="text-on-surface-variant text-xs font-medium">{{ $t('summary.min') }}</span>
          </div>
        </div>
        <div class="bg-surface-container-low rounded-xl p-5 flex flex-col justify-between min-h-[120px]">
          <span class="text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-semibold">{{ $t('summary.reps') }}</span>
          <div class="mt-3 flex items-baseline gap-1">
            <span class="text-3xl font-headline font-bold text-primary">{{ last?.reps ?? 0 }}</span>
            <span class="text-on-surface-variant text-xs font-medium">/ {{ last?.totalReps ?? 0 }}</span>
          </div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-5 flex flex-col justify-between min-h-[120px] shadow-sm">
          <div class="flex justify-between items-start">
            <span class="text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-semibold">{{ $t('summary.accuracy') }}</span>
            <span class="material-symbols-outlined text-tertiary text-base">insights</span>
          </div>
          <div class="mt-3 flex items-baseline gap-1">
            <span class="text-3xl font-headline font-bold text-primary">{{ last?.accuracy ?? 0 }}</span>
            <span class="text-on-surface-variant text-xs font-medium">%</span>
          </div>
        </div>
      </div>

      <!-- Nivel de Esfuerzo -->
      <section class="mb-12">
        <h3 class="font-headline font-bold text-xl text-primary mb-6">{{ $t('summary.effortLevel') }}</h3>
        <div class="bg-surface-container-high/40 rounded-2xl p-6">
          <div class="flex justify-between items-center gap-2">
            <button
              v-for="item in effortLevels"
              :key="item.value"
              @click="selectedEffort = item.value"
              class="group flex flex-col items-center gap-3 transition-transform active:scale-90"
            >
              <div
                class="rounded-full flex items-center justify-center transition-all duration-300"
                :class="selectedEffort === item.value
                  ? 'w-14 h-14 bg-primary text-white shadow-lg shadow-primary/20'
                  : 'w-12 h-12 bg-surface-container-lowest text-on-surface-variant hover:bg-primary hover:text-white'"
              >
                <span
                  class="material-symbols-outlined"
                  :style="selectedEffort === item.value ? `font-variation-settings: 'FILL' 1` : ''"
                >{{ item.icon }}</span>
              </div>
              <span
                class="text-[10px] font-label uppercase tracking-tighter font-bold"
                :class="selectedEffort === item.value ? 'text-primary' : 'text-on-surface-variant'"
              >{{ item.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Pain question -->
      <section class="mb-12">
        <h3 class="font-headline font-bold text-lg text-primary mb-4">{{ $t('summary.painQuestion') }}</h3>
        <div class="flex gap-3">
          <button
            @click="handlePainReport(true)"
            class="flex-1 py-3 rounded-xl text-sm font-label font-bold transition-all active:scale-95"
            :class="painAnswer === true
              ? 'bg-error text-white'
              : 'bg-surface-container-high text-on-surface-variant'"
          >{{ $t('summary.painYes') }}</button>
          <button
            @click="handlePainReport(false)"
            class="flex-1 py-3 rounded-xl text-sm font-label font-bold transition-all active:scale-95"
            :class="painAnswer === false
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-surface-container-high text-on-surface-variant'"
          >{{ $t('summary.painNo') }}</button>
        </div>
      </section>

      <!-- Progreso Semanal -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-headline font-bold text-xl text-primary">{{ $t('summary.weeklyProgress') }}</h3>
          <span class="text-xs font-semibold text-tertiary">{{ $t('summary.percentComplete', { n: weekPercent }) }}</span>
        </div>
        <div class="flex gap-2 h-12 items-end">
          <div
            v-for="(active, i) in weekActivity"
            :key="i"
            class="flex-1 rounded-t-lg transition-all duration-700"
            :class="[
              active ? 'bg-primary' : 'bg-surface-container-highest',
              i === todayIndex ? 'ring-2 ring-primary-fixed-dim ring-inset' : ''
            ]"
            :style="{ height: active ? `${40 + Math.random() * 60}%` : '10%' }"
          />
        </div>
        <div class="flex justify-between mt-3 text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest px-1">
          <span v-for="(d, i) in dayLabels" :key="i" :class="i === todayIndex ? 'text-primary' : ''">{{ d }}</span>
        </div>
      </section>
    </main>

    <!-- CTA fijo -->
    <div class="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pb-safe bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
      <div class="space-y-3">
        <!-- Next exercise button -->
        <button
          v-if="session.hasMoreExercises"
          @click="nextExercise"
          class="w-full bg-gradient-to-br from-primary to-primary-container text-white
                 font-headline font-bold py-5 rounded-xl shadow-xl shadow-primary/10
                 hover:opacity-95 active:scale-[0.98] transition-all duration-200"
        >
          {{ $t('summary.nextExercise') }}
        </button>
        <button
          @click="finish"
          class="w-full font-headline font-bold py-5 rounded-xl
                 hover:opacity-95 active:scale-[0.98] transition-all duration-200"
          :class="session.hasMoreExercises
            ? 'bg-surface-container text-primary'
            : 'bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/10'"
        >
          {{ $t('summary.finish') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/stores/session'
import { useSafetyStore } from '@/stores/safety'

const router  = useRouter()
const session = useSessionStore()
const safety  = useSafetyStore()
const { t } = useI18n()

const last = computed(() => session.lastSession)
const durationMin = computed(() => Math.ceil((last.value?.duration ?? 0) / 60))

const selectedEffort = ref(null)
const painAnswer = ref(null)

const effortLevels = computed(() => [
  { value: 1, icon: 'sentiment_satisfied',       label: t('effort.easy')    },
  { value: 2, icon: 'sentiment_neutral',          label: t('effort.light')   },
  { value: 3, icon: 'sentiment_dissatisfied',     label: t('effort.medium')  },
  { value: 4, icon: 'sentiment_very_dissatisfied', label: t('effort.hard')   },
  { value: 5, icon: 'potted_plant',               label: t('effort.intense') },
])

const weekActivity  = computed(() => session.weekActivity)

const dayKeys = ['days.mon', 'days.tue', 'days.wed', 'days.thu', 'days.fri', 'days.sat', 'days.sun']
const dayLabels = computed(() => dayKeys.map(k => t(k)))

const todayIndex    = computed(() => (new Date().getDay() + 6) % 7)
const weekPercent   = computed(() => {
  const done = weekActivity.value.filter(Boolean).length
  return Math.round((done / 7) * 100)
})

function handlePainReport(hasPain) {
  painAnswer.value = hasPain
  if (hasPain) {
    safety.reportPain()
  }
}

function nextExercise() {
  if (selectedEffort.value !== null) {
    session.completeSession(selectedEffort.value)
  }
  session.advanceToNextExercise()
  router.push('/training')
}

function finish() {
  if (selectedEffort.value !== null) {
    session.completeSession(selectedEffort.value)
  }
  router.push('/training')
}

function goBack() {
  router.push('/training')
}
</script>
