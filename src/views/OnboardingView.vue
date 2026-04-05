<template>
  <div class="min-h-dvh bg-background flex flex-col pt-safe">
    <!-- Skip -->
    <header class="flex justify-end px-6 py-4">
      <button
        @click="finish"
        class="text-on-surface-variant font-label text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors"
      >{{ $t('onboarding.skip') }}</button>
    </header>

    <!-- Steps -->
    <main class="flex-grow flex flex-col items-center justify-center px-8 max-w-lg mx-auto w-full">
      <transition name="fade" mode="out-in">
        <div :key="step" class="text-center space-y-6">
          <!-- Step 0: Welcome -->
          <template v-if="step === 0">
            <div class="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-4xl text-on-primary-container" style="font-variation-settings: 'FILL' 1">self_improvement</span>
            </div>
            <p class="text-on-surface-variant font-label text-sm uppercase tracking-widest">{{ $t('onboarding.welcome') }}</p>
            <h1 class="font-headline font-extrabold text-5xl text-primary tracking-tight">{{ $t('app.name') }}</h1>
            <p class="text-on-surface-variant text-lg leading-relaxed">{{ $t('onboarding.subtitle') }}</p>
          </template>

          <!-- Step 1: Exercises -->
          <template v-if="step === 1">
            <div class="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-4xl text-on-tertiary-fixed" style="font-variation-settings: 'FILL' 1">timer</span>
            </div>
            <h2 class="font-headline font-extrabold text-3xl text-primary">{{ $t('onboarding.step1Title') }}</h2>
            <p class="text-on-surface-variant text-base leading-relaxed">{{ $t('onboarding.step1Desc') }}</p>
          </template>

          <!-- Step 2: Programs -->
          <template v-if="step === 2">
            <div class="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-4xl text-on-secondary-container" style="font-variation-settings: 'FILL' 1">route</span>
            </div>
            <h2 class="font-headline font-extrabold text-3xl text-primary">{{ $t('onboarding.step2Title') }}</h2>
            <p class="text-on-surface-variant text-base leading-relaxed">{{ $t('onboarding.step2Desc') }}</p>
          </template>

          <!-- Step 3: Progress -->
          <template v-if="step === 3">
            <div class="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-4xl text-on-primary-container" style="font-variation-settings: 'FILL' 1">insights</span>
            </div>
            <h2 class="font-headline font-extrabold text-3xl text-primary">{{ $t('onboarding.step3Title') }}</h2>
            <p class="text-on-surface-variant text-base leading-relaxed">{{ $t('onboarding.step3Desc') }}</p>
          </template>

          <!-- Step 4: Safety -->
          <template v-if="step === 4">
            <div class="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-4xl text-on-tertiary-fixed" style="font-variation-settings: 'FILL' 1">shield</span>
            </div>
            <h2 class="font-headline font-extrabold text-3xl text-primary">{{ $t('onboarding.step4Title') }}</h2>
            <p class="text-on-surface-variant text-base leading-relaxed">{{ $t('onboarding.step4Desc') }}</p>
          </template>
        </div>
      </transition>
    </main>

    <!-- Dots + CTA -->
    <footer class="px-8 pb-12 pb-safe space-y-6 max-w-lg mx-auto w-full">
      <!-- Dots -->
      <div class="flex justify-center gap-2">
        <div
          v-for="i in totalSteps" :key="i"
          class="h-2 rounded-full transition-all duration-300"
          :class="i - 1 === step ? 'w-8 bg-primary' : 'w-2 bg-outline-variant/30'"
        />
      </div>

      <!-- Button -->
      <button
        @click="next"
        class="w-full bg-gradient-to-br from-primary to-primary-container text-white
               py-5 rounded-xl font-headline font-bold text-lg shadow-lg
               active:scale-[0.98] transition-all hover:shadow-primary/20"
      >
        {{ step < totalSteps - 1 ? $t('onboarding.next') : $t('onboarding.getStarted') }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref(0)
const totalSteps = 5

function next() {
  if (step.value < totalSteps - 1) {
    step.value++
  } else {
    finish()
  }
}

function finish() {
  localStorage.setItem('keguel_onboarded', 'true')
  router.replace('/training')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from { opacity: 0; transform: translateX(30px); }
.fade-leave-to   { opacity: 0; transform: translateX(-30px); }
</style>
