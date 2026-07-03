<template>
  <div class="min-h-dvh bg-background text-on-background flex flex-col pt-safe pb-safe">

    <main class="flex-grow flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">

      <!-- Título -->
      <div class="text-center space-y-2 mb-8">
        <p class="text-secondary font-label text-xs uppercase tracking-widest font-semibold">{{ $t('app.name') }}</p>
        <h1 class="font-headline font-extrabold text-3xl text-primary tracking-tight">{{ $t('welcome.question') }}</h1>
        <p class="text-on-surface-variant text-sm">{{ $t('welcome.subtitle') }}</p>
      </div>

      <!-- Dos escenas -->
      <div class="grid grid-cols-2 gap-4 w-full mb-8">

        <!-- ── ESCENA MASCULINA ── -->
        <button
          type="button"
          @click="select('male')"
          :aria-pressed="selectedSex === 'male'"
          :aria-label="$t('welcome.male')"
          class="scene"
          :class="{ selected: selectedSex === 'male' }"
        >
          <svg viewBox="0 0 140 180" class="avatar" role="img" aria-hidden="true">
            <!-- Ambiente: sol que sale -->
            <g class="ambient sun">
              <circle cx="112" cy="34" r="13" fill="#f5c542" />
              <g stroke="#f5c542" stroke-width="3" stroke-linecap="round" class="rays">
                <line x1="112" y1="12" x2="112" y2="4" />
                <line x1="112" y1="64" x2="112" y2="56" />
                <line x1="90" y1="34" x2="82" y2="34" />
                <line x1="142" y1="34" x2="134" y2="34" />
                <line x1="96" y1="18" x2="90" y2="12" />
                <line x1="134" y1="50" x2="128" y2="44" />
                <line x1="96" y1="50" x2="90" y2="56" />
                <line x1="134" y1="18" x2="128" y2="24" />
              </g>
            </g>

            <!-- Piernas (recortadas a media pierna) -->
            <rect x="52" y="150" width="14" height="26" rx="6" fill="#e8b58f" />
            <rect x="74" y="150" width="14" height="26" rx="6" fill="#e8b58f" />
            <!-- Pantalón azul-gris -->
            <path d="M48 118 h44 v20 q0 12 -12 12 h-8 v-14 h-4 v14 h-8 q-12 0 -12 -12 z" fill="#5f7480" />
            <!-- Torso: camiseta gris -->
            <path d="M50 96 q20 -12 40 0 l4 26 h-48 z" fill="#b0b8bd" />
            <!-- Brazo quieto (izquierda) -->
            <rect x="42" y="98" width="12" height="34" rx="6" fill="#b0b8bd" />
            <circle cx="48" cy="132" r="6" fill="#e8b58f" />
            <!-- Brazo que saluda (derecha) -->
            <g class="arm">
              <rect x="88" y="70" width="12" height="34" rx="6" fill="#b0b8bd" />
              <circle cx="94" cy="70" r="7" fill="#e8b58f" />
            </g>
            <!-- Cuello -->
            <rect x="63" y="82" width="14" height="14" fill="#e8b58f" />
            <!-- Cabeza -->
            <circle cx="70" cy="66" r="22" fill="#e8b58f" />
            <!-- Pelo corto castaño -->
            <path d="M48 64 q0 -26 22 -26 q22 0 22 26 q-8 -12 -22 -12 q-14 0 -22 12 z" fill="#6b4a2f" />
          </svg>

          <!-- Burbuja de saludo -->
          <span class="greet">👋</span>
          <span class="label">{{ $t('welcome.male') }}</span>
        </button>

        <!-- ── ESCENA FEMENINA ── -->
        <button
          type="button"
          @click="select('female')"
          :aria-pressed="selectedSex === 'female'"
          :aria-label="$t('welcome.female')"
          class="scene"
          :class="{ selected: selectedSex === 'female' }"
        >
          <svg viewBox="0 0 140 180" class="avatar" role="img" aria-hidden="true">
            <!-- Ambiente: bandada de gaviotas que cruzan aleteando -->
            <g class="ambient bird" fill="none" stroke="#6b93a8" stroke-width="2.6" stroke-linecap="round">
              <path class="gull gull-1" d="M90 34 q7 -7 14 0 q7 -7 14 0" />
              <path class="gull gull-2" d="M112 22 q4.5 -5 9 0 q4.5 -5 9 0" />
            </g>

            <!-- Piernas -->
            <rect x="54" y="150" width="12" height="26" rx="6" fill="#e8b58f" />
            <rect x="74" y="150" width="12" height="26" rx="6" fill="#e8b58f" />
            <!-- Falda azul-gris -->
            <path d="M46 116 h48 l8 34 h-64 z" fill="#5f7480" />
            <!-- Torso: top coral -->
            <path d="M52 96 q18 -12 36 0 l4 24 h-44 z" fill="#e08a7a" />
            <!-- Brazo quieto (izquierda) -->
            <rect x="44" y="98" width="11" height="32" rx="5.5" fill="#e08a7a" />
            <circle cx="49.5" cy="130" r="6" fill="#e8b58f" />
            <!-- Brazo que saluda (derecha) -->
            <g class="arm">
              <rect x="87" y="72" width="11" height="32" rx="5.5" fill="#e08a7a" />
              <circle cx="92.5" cy="72" r="6.5" fill="#e8b58f" />
            </g>
            <!-- Cuello -->
            <rect x="63" y="82" width="14" height="14" fill="#e8b58f" />
            <!-- Cabeza -->
            <circle cx="70" cy="66" r="22" fill="#e8b58f" />
            <!-- Pelo largo -->
            <path d="M46 70 q-2 -32 24 -32 q26 0 24 32 q-2 6 -6 8 v-10 q-6 -12 -18 -12 q-12 0 -18 12 v10 q-4 -2 -6 -8 z" fill="#4a3320" />
            <path d="M46 66 q-4 24 2 42 q4 -2 6 -8 q-4 -18 -2 -34 z" fill="#4a3320" />
            <path d="M94 66 q4 24 -2 42 q-4 -2 -6 -8 q4 -18 2 -34 z" fill="#4a3320" />
          </svg>

          <span class="greet">👋</span>
          <span class="label">{{ $t('welcome.female') }}</span>
        </button>
      </div>

      <!-- Nombre -->
      <div class="w-full space-y-2 mb-8">
        <label class="block text-xs font-label uppercase tracking-wider text-on-surface-variant px-1">{{ $t('welcome.nameLabel') }}</label>
        <input
          v-model="name"
          type="text"
          maxlength="30"
          :placeholder="$t('welcome.namePlaceholder')"
          class="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3.5
                 text-on-surface font-body text-base outline-none focus:border-primary transition-colors"
          @keyup.enter="create"
        />
      </div>
    </main>

    <!-- CTA -->
    <footer class="px-6 pb-8 max-w-lg mx-auto w-full">
      <button
        @click="create"
        :disabled="!canCreate"
        class="w-full bg-gradient-to-br from-primary to-primary-container text-white
               py-5 rounded-xl font-headline font-bold text-lg shadow-lg
               active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        {{ $t('welcome.start') }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

const router  = useRouter()
const profile = useProfileStore()

const name        = ref('')
const selectedSex = ref(null)

const canCreate = computed(() =>
  name.value.trim().length > 0 && (selectedSex.value === 'male' || selectedSex.value === 'female')
)

function select(sex) {
  selectedSex.value = sex
}

function create() {
  if (!canCreate.value) return
  if (profile.setIdentity(name.value, selectedSex.value)) {
    // El guard del router encaminará a onboarding si aún no se ha completado
    router.replace('/training')
  }
}

// Reutilizada desde Perfil ("cambiar de usuario"): precargar datos actuales
onMounted(() => {
  if (profile.hasIdentity) {
    name.value = profile.name
    selectedSex.value = profile.sex
  }
})
</script>

<style scoped>
/* ── Escena seleccionable ── */
.scene {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem 0.75rem;
  border-radius: 1.25rem;
  background: rgb(255 255 255 / 0.03);
  border: 2px solid transparent;
  transition: border-color 0.3s ease, background 0.3s ease, transform 0.2s ease;
}
.scene:active { transform: scale(0.97); }
.scene.selected {
  border-color: #114349;
  background: rgb(17 67 73 / 0.05);
}
/* En tema oscuro el teal profundo queda de bajo contraste → borde más luminoso */
:global(html.dark) .scene.selected {
  border-color: #5fb3bd;
  background: rgb(95 179 189 / 0.08);
}

/* ── Avatar: gris hasta seleccionar ── */
.avatar {
  width: 100%;
  height: auto;
  max-height: 190px;
  filter: grayscale(1) opacity(0.55);
  transition: filter 0.5s ease;
}
.scene.selected .avatar {
  filter: grayscale(0) opacity(1);
}

/* ── Brazo: saludo al seleccionar ── */
.arm {
  transform-box: fill-box;
  transform-origin: bottom center;
}
.scene.selected .arm {
  animation: wave 0.9s ease-in-out 0.15s 2;
}
@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25%      { transform: rotate(-24deg); }
  50%      { transform: rotate(8deg); }
  75%      { transform: rotate(-24deg); }
}

/* ── Ambiente: oculto hasta seleccionar ── */
.ambient { opacity: 0; }

/* Sol que sale */
.sun {
  transform-box: fill-box;
  transform-origin: center;
}
.scene.selected .sun {
  animation: sun-rise 0.7s ease-out 0.2s forwards;
}
.scene.selected .sun .rays {
  animation: spin 12s linear 0.9s infinite;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes sun-rise {
  0%   { opacity: 0; transform: translateY(14px) scale(0.7); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Bandada que cruza: la bandada entra volando y cada gaviota aletea */
.scene.selected .bird {
  animation: bird-fly 1.8s ease-out 0.2s forwards;
}
@keyframes bird-fly {
  0%   { opacity: 0; transform: translate(-30px, 10px); }
  30%  { opacity: 1; }
  100% { opacity: 1; transform: translate(8px, -6px); }
}
.gull {
  transform-box: fill-box;
  transform-origin: center;
}
.scene.selected .gull-1 { animation: flap 0.5s ease-in-out 0.25s infinite; }
.scene.selected .gull-2 { animation: flap 0.44s ease-in-out 0.4s infinite; }
@keyframes flap {
  0%, 100% { transform: scaleY(1); }
  50%      { transform: scaleY(0.4); }
}

/* ── Saludo emoji ── */
.greet {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 1.5rem;
  opacity: 0;
  transform: scale(0.5);
}
.scene.selected .greet {
  animation: greet-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s forwards;
}
@keyframes greet-pop {
  to { opacity: 1; transform: scale(1); }
}

/* ── Etiqueta ── */
.label {
  font-family: inherit;
  font-weight: 700;
  font-size: 0.95rem;
  color: #6b7b82;
  transition: color 0.3s ease;
}
.scene.selected .label { color: #114349; }
:global(html.dark) .scene.selected .label { color: #7fd0d9; }

@media (prefers-reduced-motion: reduce) {
  .scene.selected .arm,
  .scene.selected .sun,
  .scene.selected .sun .rays,
  .scene.selected .bird,
  .scene.selected .gull-1,
  .scene.selected .gull-2,
  .scene.selected .greet { animation: none; }
  .ambient, .greet { opacity: 1; }
}
</style>
