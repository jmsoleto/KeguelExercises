<template>
  <div class="min-h-dvh bg-background text-on-background pb-40">

    <!-- TopBar -->
    <header class="flex items-center gap-3 px-6 py-4 pt-safe sticky top-0 z-40 bg-background bg-glass">
      <button
        @click="router.back()"
        aria-label="Volver"
        class="material-symbols-outlined text-primary hover:bg-surface-container-low
               transition-colors rounded-full p-2 active:scale-95 duration-200"
      >arrow_back</button>
      <h1 class="font-headline font-bold text-xl text-primary">{{ $t('free.title') }}</h1>
    </header>

    <main class="max-w-lg mx-auto px-6 pt-2 space-y-8">

      <ComingSoon v-if="isFemale" />

      <template v-else>
      <p class="text-on-surface-variant text-sm leading-relaxed">
        {{ $t('free.description') }}
      </p>

      <!-- Resumen -->
      <section class="grid grid-cols-3 gap-3">
        <div class="bg-surface-container-high rounded-2xl p-4 flex flex-col gap-1">
          <span class="text-[10px] text-on-secondary-container uppercase tracking-wider font-semibold">{{ $t('free.totalReps') }}</span>
          <span class="text-2xl font-headline font-bold text-primary">{{ free.totalReps }}</span>
        </div>
        <div class="bg-surface-container-high rounded-2xl p-4 flex flex-col gap-1">
          <span class="text-[10px] text-on-secondary-container uppercase tracking-wider font-semibold">{{ $t('free.blocks') }}</span>
          <span class="text-2xl font-headline font-bold text-primary">{{ free.totalBlocks }}</span>
        </div>
        <div class="bg-surface-container-high rounded-2xl p-4 flex flex-col gap-1">
          <span class="text-[10px] text-on-secondary-container uppercase tracking-wider font-semibold">{{ $t('free.duration') }}</span>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-headline font-bold text-primary">{{ free.totalMinutes }}</span>
            <span class="text-on-surface-variant text-xs">{{ $t('training.min').toLowerCase() }}</span>
          </div>
        </div>
      </section>

      <!-- Secuencia de bloques -->
      <section class="space-y-3">
        <h2 class="font-headline font-bold text-base text-primary px-1">{{ $t('free.sequence') }}</h2>

        <!-- Estado vacío -->
        <div
          v-if="free.items.length === 0"
          class="bg-surface-container-low rounded-3xl p-8 text-center text-sm text-on-surface-variant"
        >
          {{ $t('free.empty') }}
        </div>

        <TransitionGroup name="block-list" tag="div" class="space-y-3">
          <div
            v-for="(item, index) in free.items"
            :key="item.id"
            class="bg-surface-container-lowest rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.06] -translate-y-5 translate-x-5"
              :style="{ background: META[item.type].accent }"
            />

            <!-- Cabecera del bloque -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                   :style="{ background: META[item.type].accent + '22', color: META[item.type].accent }">
                <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1">{{ META[item.type].icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-label font-bold text-outline tabular-nums">{{ index + 1 }}</span>
                  <h3 class="font-headline font-bold text-base text-primary truncate">{{ $t(`free.types.${LABEL_KEY[item.type]}`) }}</h3>
                </div>
                <p class="text-[11px] text-on-surface-variant leading-snug truncate">{{ $t(`free.hints.${LABEL_KEY[item.type]}`) }}</p>
              </div>

              <!-- Reordenar / eliminar -->
              <div class="flex items-center gap-0.5 flex-shrink-0">
                <button
                  @click="free.move(item.id, -1)"
                  :disabled="index === 0"
                  aria-label="Subir bloque"
                  class="ctrl-btn text-on-surface-variant"
                >
                  <span class="material-symbols-outlined text-lg">keyboard_arrow_up</span>
                </button>
                <button
                  @click="free.move(item.id, 1)"
                  :disabled="index === free.items.length - 1"
                  aria-label="Bajar bloque"
                  class="ctrl-btn text-on-surface-variant"
                >
                  <span class="material-symbols-outlined text-lg">keyboard_arrow_down</span>
                </button>
                <button
                  @click="free.removeItem(item.id)"
                  aria-label="Eliminar bloque"
                  class="ctrl-btn text-error/70 hover:text-error"
                >
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            <!-- Reps + duración -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-label text-on-surface-variant">{{ $t('free.repsPerSet') }}</span>
                <div class="flex items-center gap-3">
                  <button
                    @click="free.setReps(item.id, item.reps - 1)"
                    aria-label="Menos repeticiones"
                    class="step-btn"
                  >
                    <span class="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <span class="w-8 text-center font-headline font-bold text-xl text-primary tabular-nums">{{ item.reps }}</span>
                  <button
                    @click="free.setReps(item.id, item.reps + 1)"
                    aria-label="Más repeticiones"
                    class="step-btn"
                  >
                    <span class="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>

              <!-- Duración -->
              <div class="flex items-center justify-between">
                <span class="text-sm font-label text-on-surface-variant">
                  {{ item.type === 'reverse' ? $t('free.pushDuration') : $t('free.holdDuration') }}
                </span>
                <div class="flex items-center gap-1.5 bg-surface-container-high rounded-full p-1">
                  <button
                    v-for="d in DURATION_OPTIONS[item.type]"
                    :key="d"
                    @click="free.setDuration(item.id, d)"
                    :aria-pressed="item.duration === d"
                    class="px-3.5 py-1.5 rounded-full text-sm font-label font-bold tabular-nums transition-colors duration-150"
                    :class="item.duration === d ? 'bg-primary text-white' : 'text-on-surface-variant'"
                  >{{ d }}s</button>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </section>

      <!-- Añadir bloque -->
      <section class="space-y-3">
        <h2 class="font-headline font-bold text-base text-primary px-1">{{ $t('free.addBlock') }}</h2>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="type in TYPES"
            :key="type"
            @click="free.addItem(type)"
            class="flex flex-col items-center gap-2 bg-surface-container-lowest rounded-2xl py-4 px-2
                   shadow-sm active:scale-95 transition-transform duration-150"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 :style="{ background: META[type].accent + '22', color: META[type].accent }">
              <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1">{{ META[type].icon }}</span>
            </div>
            <span class="text-xs font-label font-bold text-primary">{{ $t(`free.types.${LABEL_KEY[type]}`) }}</span>
          </button>
        </div>
      </section>

      </template>
    </main>

    <!-- CTA fijo -->
    <div v-if="!isFemale" class="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pb-safe bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
      <div class="max-w-lg mx-auto">
        <button
          @click="start"
          :disabled="!free.isValid"
          class="w-full bg-gradient-to-br from-primary to-primary-container text-white
                 font-headline font-bold text-lg py-5 rounded-xl shadow-xl shadow-primary/10
                 active:scale-[0.98] transition-all duration-200
                 disabled:opacity-40 disabled:active:scale-100"
        >
          {{ $t('free.start') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFreeModeStore, DURATION_OPTIONS } from '@/stores/freeMode'
import { useSessionStore } from '@/stores/session'
import { useProfileStore } from '@/stores/profile'
import { useI18n } from 'vue-i18n'
import ComingSoon from '@/components/ComingSoon.vue'

const router  = useRouter()
const free    = useFreeModeStore()
const session = useSessionStore()
const profile = useProfileStore()
const { t }   = useI18n()

const isFemale = computed(() => profile.sex === 'female')

const TYPES = ['slow', 'fast', 'reverse']
const LABEL_KEY = { slow: 'long', fast: 'short', reverse: 'push' }
const META = {
  slow:    { icon: 'timelapse',    accent: '#114349' },
  fast:    { icon: 'bolt',         accent: '#48626e' },
  reverse: { icon: 'open_in_full', accent: '#214337' },
}

function start() {
  if (!free.isValid) return
  session.prepareFreeSession(free.buildBlocks(), t('free.sessionName'))
  router.push('/training')
}
</script>

<style scoped>
.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.ctrl-btn:active { transform: scale(0.9); }
.ctrl-btn:disabled { opacity: 0.25; pointer-events: none; }

.step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: #ddeaf2;            /* surface-container-high */
  color: #114349;                /* primary */
  transition: transform 0.15s ease;
}
.step-btn:active { transform: scale(0.9); }

/* Animación de reordenado / alta / baja */
.block-list-move { transition: transform 0.25s ease; }
.block-list-enter-active,
.block-list-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.block-list-enter-from { opacity: 0; transform: translateY(-8px); }
.block-list-leave-to   { opacity: 0; transform: scale(0.96); }
.block-list-leave-active { position: absolute; width: calc(100% - 3rem); }
</style>
