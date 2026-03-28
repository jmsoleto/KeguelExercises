<template>
  <div class="min-h-dvh bg-background pb-12">
    <!-- TopBar con botón volver -->
    <header class="flex items-center justify-between px-6 py-4 pt-safe sticky top-0 z-40 bg-background bg-glass">
      <div class="flex items-center gap-3">
        <button
          @click="$router.back()"
          aria-label="Volver"
          class="material-symbols-outlined text-primary hover:bg-surface-container-low
                 transition-colors active:scale-95 rounded-full p-2"
        >arrow_back</button>
        <h1 class="font-headline font-semibold text-lg text-primary">{{ $t('profile.title') }}</h1>
      </div>
      <button class="material-symbols-outlined text-secondary hover:text-primary p-2 rounded-xl hover:bg-surface-container-low transition-colors">
        settings
      </button>
    </header>

    <main class="max-w-2xl mx-auto px-6 pt-4 space-y-10">

      <!-- Avatar + nombre -->
      <section class="flex flex-col items-center gap-4 py-4">
        <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center shadow-lg">
          <span class="material-symbols-outlined text-5xl text-on-primary-container" style="font-variation-settings: 'FILL' 1">person</span>
        </div>
        <div class="text-center">
          <div v-if="!editingName" class="flex items-center justify-center gap-2 cursor-pointer group" @click="startEditName">
            <h2 class="font-headline font-extrabold text-2xl text-primary">{{ profile.name }}</h2>
            <span class="material-symbols-outlined text-outline-variant text-sm opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
          </div>
          <div v-else class="flex items-center justify-center gap-2">
            <input
              v-model="nameInput"
              @keyup.enter="saveName"
              @blur="saveName"
              maxlength="30"
              autofocus
              class="font-headline font-extrabold text-2xl text-primary text-center bg-transparent border-b-2 border-primary outline-none w-48"
            />
          </div>
          <div class="flex justify-center gap-3 mt-2">
            <span class="bg-surface-container-low px-3 py-1.5 rounded-xl text-xs font-label font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">military_tech</span>
              {{ userLevel }}
            </span>
            <span class="bg-surface-container-low px-3 py-1.5 rounded-xl text-xs font-label font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">exercise</span>
              {{ totalSessions }} {{ $t('profile.sessions') }}
            </span>
          </div>
        </div>
      </section>

      <!-- Consistencia Semanal -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-xl text-primary">{{ $t('profile.weeklyConsistency') }}</h3>
        <div class="bg-surface-container-low rounded-xl p-5 flex items-end justify-between h-28 gap-2">
          <div
            v-for="(active, i) in weekActivity"
            :key="i"
            class="w-full bg-surface-container-highest rounded-full relative overflow-hidden"
            style="height: 80px"
          >
            <div
              class="absolute bottom-0 w-full rounded-t-full transition-all duration-700"
              :class="active ? 'bg-primary' : 'bg-surface-container-high'"
              :style="{ height: active ? barHeights[i] : '10%' }"
            />
          </div>
        </div>
      </section>

      <!-- Cuenta -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-lg text-primary px-2">{{ $t('profile.account') }}</h3>
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div class="flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors cursor-pointer group">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-secondary">person</span>
              <span class="font-body font-medium text-on-surface">{{ $t('profile.personalProfile') }}</span>
            </div>
            <span class="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
          </div>
        </div>
      </section>

      <!-- Entrenamiento -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-lg text-primary px-2">{{ $t('profile.training') }}</h3>
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <!-- Recordatorios -->
          <div class="flex items-center justify-between p-5">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-secondary">notifications</span>
              <div>
                <span class="font-body font-medium text-on-surface">{{ $t('profile.dailyReminders') }}</span>
                <p v-if="notif.permissionDenied" class="text-xs text-error mt-0.5">{{ $t('profile.permissionDenied') }}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer" :class="{ 'opacity-50 pointer-events-none': notifBusy }">
              <input v-model="settings.notifications" type="checkbox" class="sr-only peer" @change="toggleNotifications" :aria-label="$t('profile.dailyReminders')" />
              <div class="w-11 h-6 bg-surface-container-highest rounded-full peer
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                          after:bg-white after:border after:rounded-full after:h-5 after:w-5
                          after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
          <transition name="slide">
            <div v-if="settings.notifications" class="flex items-center justify-between px-5 pb-4 pt-1">
              <div class="flex items-center gap-4 pl-10">
                <span class="material-symbols-outlined text-outline text-sm">schedule</span>
                <span class="font-label text-sm text-on-surface-variant">{{ $t('profile.reminderTime') }}</span>
              </div>
              <input
                type="time"
                :value="String(notif.reminderHour).padStart(2,'0') + ':' + String(notif.reminderMin).padStart(2,'0')"
                @change="e => { const [h,m] = e.target.value.split(':').map(Number); notif.reminderHour = h; notif.reminderMin = m; updateReminderTime() }"
                class="bg-surface-container-low text-on-surface font-label text-sm rounded-lg px-3 py-1.5 border border-outline-variant focus:border-primary outline-none transition-colors"
              />
            </div>
          </transition>
          <div class="h-px bg-surface-container-high mx-5" />
          <!-- Vibración -->
          <div class="flex items-center justify-between p-5">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-secondary">vibration</span>
              <span class="font-body font-medium text-on-surface">{{ $t('profile.exerciseVibration') }}</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.vibration" type="checkbox" class="sr-only peer" :aria-label="$t('profile.exerciseVibration')" />
              <div class="w-11 h-6 bg-surface-container-highest rounded-full peer
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                          after:bg-white after:border after:rounded-full after:h-5 after:w-5
                          after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
          <div class="h-px bg-surface-container-high mx-5" />
          <!-- Feedback sonoro -->
          <div class="flex items-center justify-between p-5">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-secondary">volume_up</span>
              <span class="font-body font-medium text-on-surface">{{ $t('profile.soundFeedback') }}</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.sound" type="checkbox" class="sr-only peer" @change="toggleSound" :aria-label="$t('profile.soundFeedback')" />
              <div class="w-11 h-6 bg-surface-container-highest rounded-full peer
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                          after:bg-white after:border after:rounded-full after:h-5 after:w-5
                          after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>
      </section>

      <!-- Aplicación -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-lg text-primary px-2">{{ $t('profile.application') }}</h3>
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div
            @click="settings.cycleDarkMode()"
            class="flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-secondary">
                {{ settings.darkMode === 'dark' ? 'dark_mode' : settings.darkMode === 'light' ? 'light_mode' : 'brightness_auto' }}
              </span>
              <span class="font-body font-medium text-on-surface">{{ $t('profile.darkMode') }}</span>
            </div>
            <div class="flex items-center">
              <span class="font-label text-sm text-outline mr-2">{{ $t(`darkModes.${settings.darkMode}`) }}</span>
              <span class="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
            </div>
          </div>
          <div class="h-px bg-surface-container-high mx-5" />
          <!-- Idioma -->
          <div
            @click="cycleLocale"
            class="flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-secondary">language</span>
              <span class="font-body font-medium text-on-surface">{{ $t('profile.language') }}</span>
            </div>
            <div class="flex items-center">
              <span class="font-label text-sm text-outline mr-2">{{ currentLocaleName }}</span>
              <span class="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Respaldo de datos -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-lg text-primary px-2">{{ $t('profile.dataBackup') }}</h3>
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div
            @click="exportData"
            class="flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-secondary">download</span>
              <span class="font-body font-medium text-on-surface">{{ $t('profile.exportData') }}</span>
            </div>
            <span class="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
          </div>
          <div class="h-px bg-surface-container-high mx-5" />
          <div
            @click="triggerImport"
            class="flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-secondary">upload</span>
              <span class="font-body font-medium text-on-surface">{{ $t('profile.importData') }}</span>
            </div>
            <span class="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
          </div>
          <input ref="fileInput" type="file" accept=".json" class="hidden" @change="importData" />
        </div>
        <transition name="slide">
          <p v-if="dataMessage" class="text-xs font-semibold px-2" :class="dataMessageError ? 'text-error' : 'text-tertiary'">
            {{ dataMessage }}
          </p>
        </transition>
      </section>

      <!-- Version -->
      <section class="pt-2 text-center pb-4">
        <p class="font-label text-xs text-outline uppercase tracking-[0.2em]">{{ $t('app.name') }} {{ $t('app.version') }}</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/stores/session'
import { useSettingsStore } from '@/stores/settings'
import { useNotificationsStore } from '@/stores/notifications'
import { useProfileStore } from '@/stores/profile'
import { useSoundService } from '@/stores/sound'
import { setLocale, getLocale } from '@/i18n'

const { t } = useI18n()
const session  = useSessionStore()
const settings = useSettingsStore()
const notif    = useNotificationsStore()
const profile  = useProfileStore()
const sound    = useSoundService()

// ─── Edición de nombre ───
const editingName  = ref(false)
const nameInput    = ref('')

function startEditName() {
  nameInput.value = profile.name
  editingName.value = true
}
function saveName() {
  profile.updateName(nameInput.value)
  editingName.value = false
}

// ─── Stats ───
const totalSessions = computed(() => session.history.length)
const weekActivity  = computed(() => session.weekActivity)
const userLevel     = computed(() => {
  if (totalSessions.value < 10)  return t('levels.beginner')
  if (totalSessions.value < 30)  return t('levels.regular')
  if (totalSessions.value < 75)  return t('levels.consistent')
  if (totalSessions.value < 150) return t('levels.advanced')
  return t('levels.expert')
})

const barHeights = ['60%', '75%', '50%', '85%', '100%', '65%', '45%']

// ─── Sound ───
function toggleSound() {
  if (settings.sound) sound.playPhaseChange('contract')
}

// ─── Notificaciones ───
const notifBusy = ref(false)

async function toggleNotifications() {
  notifBusy.value = true
  try {
    const success = await notif.toggle(settings.notifications)
    if (!success) settings.notifications = false
  } finally {
    notifBusy.value = false
  }
}
async function updateReminderTime() {
  if (notif.enabled) await notif.scheduleDaily(notif.reminderHour, notif.reminderMin)
}

// ─── Idioma ───
const locales = ['es', 'en']
const localeNames = { es: 'Español', en: 'English' }
const currentLocaleName = computed(() => localeNames[getLocale()] || 'Español')

function cycleLocale() {
  const current = getLocale()
  const idx = locales.indexOf(current)
  const next = locales[(idx + 1) % locales.length]
  setLocale(next)
}

// ─── Export / Import datos ───
const fileInput = ref(null)
const dataMessage = ref('')
const dataMessageError = ref(false)

function exportData() {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    history: session.history,
    profile: { name: profile.name },
    settings: {
      vibration: settings.vibration,
      sound: settings.sound,
      darkMode: settings.darkMode,
      notifications: settings.notifications,
    },
    program: {
      id: localStorage.getItem('keguel_program'),
      week: localStorage.getItem('keguel_week'),
    },
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pelvicforce-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)

  dataMessage.value = t('profile.exportSuccess')
  dataMessageError.value = false
  setTimeout(() => { dataMessage.value = '' }, 3000)
}

function triggerImport() {
  fileInput.value?.click()
}

function importData(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)

      if (!data.history || !Array.isArray(data.history)) {
        throw new Error('Invalid format')
      }

      if (!confirm(t('profile.importConfirm'))) return

      // Restaurar historial
      session.history.splice(0, session.history.length, ...data.history)
      localStorage.setItem('keguel_history', JSON.stringify(data.history))

      // Restaurar perfil
      if (data.profile?.name) profile.updateName(data.profile.name)

      // Restaurar programa
      if (data.program?.id) {
        localStorage.setItem('keguel_program', data.program.id)
        localStorage.setItem('keguel_week', data.program.week || '1')
      }

      dataMessage.value = t('profile.importSuccess', { n: data.history.length })
      dataMessageError.value = false
    } catch {
      dataMessage.value = t('profile.importError')
      dataMessageError.value = true
    }
    setTimeout(() => { dataMessage.value = '' }, 4000)
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>
