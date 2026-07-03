<template>
  <section class="flex flex-col items-center gap-6 py-12 px-6 text-center">
    <div class="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
      <span class="material-symbols-outlined text-4xl text-on-secondary-container" style="font-variation-settings: 'FILL' 1">hourglass_top</span>
    </div>
    <div class="space-y-2 max-w-sm">
      <h2 class="font-headline font-bold text-xl text-primary">{{ $t('comingSoon.title') }}</h2>
      <p class="text-sm text-on-surface-variant leading-relaxed">{{ $t('comingSoon.body') }}</p>
    </div>
    <RouterLink to="/profile" class="text-sm font-label font-bold text-primary flex items-center gap-1.5">
      <span class="material-symbols-outlined text-base">manage_accounts</span>
      {{ $t('comingSoon.changeUser') }}
    </RouterLink>
  </section>
</template>
