<template>
  <div class="min-h-dvh bg-background pb-28">

    <!-- TopBar -->
    <header class="flex items-center px-6 py-4 pt-safe sticky top-0 z-40 bg-background bg-glass">
      <h1 class="font-headline font-bold text-xl text-primary">{{ $t('program.title') }}</h1>
    </header>

    <main class="max-w-lg mx-auto px-6 pt-2 space-y-6">

      <p class="text-on-surface-variant text-sm">
        {{ $t('program.chooseDescription') }}
      </p>

      <!-- Lista de todos los programas -->
      <div class="space-y-5">
        <RouterLink
          v-for="program in PROGRAMS"
          :key="program.id"
          :to="`/program/${program.id}`"
          class="block bg-surface-container-lowest rounded-2xl p-6 shadow-sm
                 active:scale-[0.98] transition-all duration-200 space-y-4 relative overflow-hidden"
          :class="isActive(program.id) ? 'ring-2 ring-primary' : ''"
        >
          <!-- Fondo decorativo -->
          <div
            class="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-8 translate-x-8"
            :style="{ background: program.accentColor }"
          />

          <!-- Header -->
          <div class="flex items-start justify-between">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', program.colorClass]">
              <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1">
                {{ program.icon }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <!-- Badge "activo" si es el plan seleccionado -->
              <span
                v-if="isActive(program.id)"
                class="bg-primary text-white text-[10px] font-label font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              >
                {{ $t('program.activeProgram') }}
              </span>
              <span class="text-xs font-label font-semibold text-outline uppercase tracking-wider">
                {{ program.totalWeeks ? `${program.totalWeeks} sem.` : $t('program.ongoing') }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div>
            <h3 class="font-headline font-bold text-lg text-primary">{{ program.name }}</h3>
            <p class="text-xs font-semibold text-secondary mt-0.5 uppercase tracking-wider">{{ program.benefit }}</p>
            <p class="text-on-surface-variant text-sm mt-2 leading-relaxed">{{ program.description }}</p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs text-outline">{{ $t('program.perDay', { n: program.sessionsPerDay }) }}</span>
            <span class="flex items-center gap-1 text-primary font-label font-bold text-sm">
              {{ $t('program.viewDetails') }}
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </span>
          </div>
        </RouterLink>
      </div>

    </main>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useRoutinesStore, PROGRAMS } from '@/stores/routines'

const routines = useRoutinesStore()
const { selectedProgramId } = storeToRefs(routines)

function isActive(programId) {
  return selectedProgramId.value === programId
}
</script>
