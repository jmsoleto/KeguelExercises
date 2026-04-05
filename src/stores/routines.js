import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─────────────────────────────────────────────
// CATÁLOGO DE EJERCICIOS
//
// 7 tipos de ejercicio con base médica.
// Fuentes: Mayo Clinic, Cleveland Clinic, Harvard Health,
// PubMed (PMC1324914), Journal of Sexual Medicine.
// ─────────────────────────────────────────────

export const EXERCISES = [
  {
    id: 'quick_flicks',
    name: 'Contracciones rápidas',
    description: 'Contracciones cortas y rápidas del suelo pélvico para entrenar fibras musculares de respuesta rápida.',
    instructions: [
      'Contrae los músculos del suelo pélvico con fuerza',
      'Mantén 1-2 segundos',
      'Relaja completamente',
      'Repite a ritmo de ~1 por segundo',
    ],
    targetFibers: 'fast_twitch',
    difficulty: 'beginner',
    category: 'contraction',
    iconKey: 'bolt',
    warnings: ['No empujes hacia abajo', 'Respira normalmente'],
  },
  {
    id: 'long_holds',
    name: 'Contracciones sostenidas',
    description: 'Contracción mantenida durante varios segundos para desarrollar resistencia y fuerza del suelo pélvico.',
    instructions: [
      'Contrae los músculos del suelo pélvico',
      'Mantén la contracción el tiempo indicado',
      'Siente la elevación hacia el ombligo',
      'Relaja completamente durante el mismo tiempo',
    ],
    targetFibers: 'slow_twitch',
    difficulty: 'beginner',
    category: 'contraction',
    iconKey: 'self_improvement',
    warnings: ['No contengas la respiración', 'No tenses abdominales ni glúteos'],
  },
  {
    id: 'elevator',
    name: 'Elevador',
    description: 'Contracción graduada en niveles ascendentes, como si elevaras un ascensor planta por planta.',
    instructions: [
      'Contrae al 25% de tu fuerza máxima (planta 1)',
      'Sube al 50% y mantén (planta 2)',
      'Sube al 75% y mantén (planta 3)',
      'Contrae al 100% (planta 4)',
      'Desciende gradualmente: 75% → 50% → 25% → relajación total',
    ],
    targetFibers: 'mixed',
    difficulty: 'intermediate',
    category: 'contraction',
    iconKey: 'keyboard_double_arrow_up',
    warnings: ['Requiere buena propiocepción', 'Domina long_holds antes de intentar'],
  },
  {
    id: 'reverse_kegel',
    name: 'Kegel inverso',
    description: 'Relajación controlada del suelo pélvico. Esencial para evitar hipertonía y mejorar control eyaculatorio.',
    instructions: [
      'Relaja conscientemente los músculos del suelo pélvico',
      'Empuja suavemente como si fueras a expulsar gas',
      'NO empujes con fuerza, el movimiento es sutil',
      'Mantén la relajación el tiempo indicado',
      'Vuelve al estado neutro (no contraigas)',
    ],
    targetFibers: 'relaxation',
    difficulty: 'intermediate',
    category: 'relaxation',
    iconKey: 'air',
    warnings: ['No empujes con fuerza', 'Si sientes dolor, detente'],
  },
  {
    id: 'bridge_kegel',
    name: 'Puente con Kegel',
    description: 'Ejercicio compuesto que combina la elevación de cadera (puente de glúteos) con contracción del suelo pélvico.',
    instructions: [
      'Acuéstate boca arriba con rodillas flexionadas',
      'Pies apoyados, talones cerca de los glúteos',
      'Inhala y eleva la cadera formando un puente',
      'En la posición superior, contrae el suelo pélvico',
      'Mantén la contracción el tiempo indicado',
      'Relaja el suelo pélvico y baja la cadera lentamente',
    ],
    targetFibers: 'mixed',
    difficulty: 'intermediate',
    category: 'compound',
    iconKey: 'fitness_center',
    warnings: ['No arquees excesivamente la espalda', 'Mantén los hombros apoyados'],
  },
  {
    id: 'squat_kegel',
    name: 'Sentadilla con Kegel',
    description: 'Sentadilla sumo combinada con contracción pélvica al subir. Fortalece piernas, glúteos y suelo pélvico.',
    instructions: [
      'Pies más anchos que caderas, puntas a 45°',
      'Manos al pecho, pelvis ligeramente basculada',
      'Inhala y baja a posición de sentadilla',
      'Pausa 3 segundos abajo',
      'Exhala, contrae suelo pélvico y sube',
      'Relaja al llegar arriba',
    ],
    targetFibers: 'mixed',
    difficulty: 'advanced',
    category: 'compound',
    iconKey: 'directions_walk',
    warnings: ['Mantén espalda recta', 'Rodillas alineadas con puntas de pies'],
  },
  {
    id: 'isometric_hold',
    name: 'Isométrico graduado',
    description: 'Mantener contracción a diferentes porcentajes de intensidad para desarrollar control neuromuscular fino.',
    instructions: [
      'Contrae al 25% de tu fuerza máxima y mantén 3s',
      'Sube al 50% y mantén 3s',
      'Sube al 75% y mantén 3s',
      'Contrae al 100% y mantén 3s',
      'Relaja completamente durante 3s',
      'Repite',
    ],
    targetFibers: 'neuromuscular',
    difficulty: 'advanced',
    category: 'contraction',
    iconKey: 'tune',
    warnings: ['Solo para usuarios avanzados', 'Domina elevator antes de intentar'],
  },
]

// ─────────────────────────────────────────────
// PROGRAMAS DE ENTRENAMIENTO
//
// 6 planes con base médica y progresión semanal.
// Cada plan tiene fases, cada fase tiene un weeklySchedule
// con sesiones diarias y ejercicios específicos.
//
// Estructura de un ejercicio dentro de una sesión:
//   { exerciseId, contractSeconds, relaxSeconds, reps, levels?, prepareSeconds? }
//
// - exerciseId: referencia al catálogo EXERCISES
// - contractSeconds: duración de la contracción (o push-out en reverse_kegel)
// - relaxSeconds: duración de la relajación
// - reps: número de repeticiones
// - levels: (opcional) número de niveles para elevator/isometric_hold
// - prepareSeconds: (opcional) tiempo de preparación para compound exercises
// ─────────────────────────────────────────────

export const PROGRAMS = [
  // ───── PLAN 1: Fundamentos (4 semanas) ─────
  {
    id: 'foundations',
    name: 'Fundamentos',
    tagline: 'Aprende desde cero',
    shortDescription: 'Aprende a controlar tu suelo pélvico desde cero.',
    description: 'Plan de iniciación para identificar, aislar y fortalecer los músculos del suelo pélvico. Ideal si nunca has hecho Kegel o quieres asegurarte de que tu técnica es correcta.',
    objective: 'general_strength',
    totalWeeks: 4,
    level: 'beginner',
    sessionsPerDay: 2,
    icon: 'menu_book',
    colorClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    accentColor: '#4CAF50',
    benefit: 'Fortalecimiento general',
    medicalWarning: null,
    phases: [
      {
        id: 'foundations_p1',
        name: 'Identificación',
        weeks: [1, 2],
        description: 'Aprende a encontrar y aislar los músculos correctos.',
        tip: 'Si notas que aprietas el culo o aguantas la respiración, lo estás haciendo mal. Respira normal.',
        weeklySchedule: [
          {
            week: 1,
            sessions: [
              { id: 'f1w1_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 5 }] },
              { id: 'f1w1_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 5 }] },
            ],
          },
          {
            week: 2,
            sessions: [
              { id: 'f1w2_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 8 }] },
              { id: 'f1w2_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 8 }] },
            ],
          },
        ],
      },
      {
        id: 'foundations_p2',
        name: 'Construcción',
        weeks: [3, 4],
        description: 'Aumenta la duración y añade variedad de contracciones.',
        tip: 'La relajación es tan importante como la contracción. Asegúrate de soltar completamente entre reps.',
        weeklySchedule: [
          {
            week: 3,
            sessions: [
              { id: 'f2w3_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 4, relaxSeconds: 4, reps: 10 }] },
              { id: 'f2w3_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 10 }] },
              { id: 'f2w3_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 4, relaxSeconds: 4, reps: 10 }] },
            ],
          },
          {
            week: 4,
            sessions: [
              { id: 'f2w4_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'f2w4_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 15 }] },
              { id: 'f2w4_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
        ],
      },
    ],
  },

  // ───── PLAN 2: Control urinario (8 semanas) ─────
  {
    id: 'urinary_control',
    name: 'Control urinario',
    tagline: 'Recupera el control',
    shortDescription: 'Recupera el control de tu vejiga.',
    description: 'Programa enfocado en fortalecer la musculatura responsable del cierre uretral. Para hombres con incontinencia leve, goteo post-miccional o urgencia urinaria.',
    objective: 'urinary_continence',
    totalWeeks: 8,
    level: 'beginner_to_intermediate',
    sessionsPerDay: 3,
    icon: 'water_drop',
    colorClass: 'bg-primary-fixed text-on-primary-fixed',
    accentColor: '#2196F3',
    benefit: 'Control de vejiga',
    medicalWarning: null,
    phases: [
      {
        id: 'uc_p1',
        name: 'Base',
        weeks: [1, 2],
        description: 'Establece la base de fuerza con contracciones sostenidas.',
        tip: 'Imagina que intentas cortar el flujo de orina a la mitad. Eso es exactamente el músculo que necesitas.',
        weeklySchedule: [
          {
            week: 1,
            sessions: [
              { id: 'uc1w1_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
              { id: 'uc1w1_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
            ],
          },
          {
            week: 2,
            sessions: [
              { id: 'uc1w2_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
              { id: 'uc1w2_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'uc_p2',
        name: 'Progresión',
        weeks: [3, 4],
        description: 'Aumenta duración de contracciones y añade flicks rápidos.',
        tip: 'Mantén el nivel máximo de contracción durante todo el hold. Es fácil bajar la intensidad a mitad sin darte cuenta.',
        weeklySchedule: [
          {
            week: 3,
            sessions: [
              { id: 'uc2w3_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'uc2w3_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 }] },
              { id: 'uc2w3_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
          {
            week: 4,
            sessions: [
              { id: 'uc2w4_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'uc2w4_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 }] },
              { id: 'uc2w4_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'uc_p3',
        name: 'Intensificación',
        weeks: [5, 6],
        description: 'Contracciones más largas y ejercicio de elevador.',
        tip: 'El elevador es un ejercicio avanzado. Si no lo sientes, vuelve a long_holds.',
        weeklySchedule: [
          {
            week: 5,
            sessions: [
              { id: 'uc3w5_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
              { id: 'uc3w5_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 5, levels: 4 },
              ] },
              { id: 'uc3w5_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
            ],
          },
          {
            week: 6,
            sessions: [
              { id: 'uc3w6_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
              { id: 'uc3w6_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 5, levels: 4 },
              ] },
              { id: 'uc3w6_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'uc_p4',
        name: 'Consolidación',
        weeks: [7, 8],
        description: 'Máxima duración de contracciones con programa completo.',
        tip: 'En esta fase los resultados suelen ser más notorios. Mantén la consistencia aunque ya notes mejora.',
        weeklySchedule: [
          {
            week: 7,
            sessions: [
              { id: 'uc4w7_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'uc4w7_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 8, levels: 4 },
              ] },
              { id: 'uc4w7_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 8,
            sessions: [
              { id: 'uc4w8_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'uc4w8_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 8, levels: 4 },
              ] },
              { id: 'uc4w8_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
        ],
      },
    ],
  },

  // ───── PLAN 3: Rendimiento sexual (12 semanas) ─────
  {
    id: 'sexual_performance',
    name: 'Rendimiento sexual',
    tagline: 'Flujo y firmeza',
    shortDescription: 'Mejora la rigidez eréctil y el rendimiento.',
    description: 'Programa de 12 semanas diseñado para fortalecer específicamente el bulbocavernoso e isquiocavernoso, los músculos responsables de la rigidez eréctil y el control sanguíneo durante la erección.',
    objective: 'erectile_function',
    totalWeeks: 12,
    level: 'beginner_to_advanced',
    sessionsPerDay: 3,
    icon: 'favorite',
    colorClass: 'bg-primary-fixed text-on-primary-fixed',
    accentColor: '#E91E63',
    benefit: 'Función eréctil',
    medicalWarning: null,
    phases: [
      {
        id: 'sp_p1',
        name: 'Base vascular',
        weeks: [1, 2],
        description: 'Contracciones moderadas para comenzar a activar la circulación pélvica sin sobrecargar.',
        tip: 'Imagina que intentas cortar el flujo de orina a la mitad. Eso es exactamente el músculo que necesitas.',
        weeklySchedule: [
          {
            week: 1,
            sessions: [
              { id: 'sp1w1_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
              { id: 'sp1w1_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
            ],
          },
          {
            week: 2,
            sessions: [
              { id: 'sp1w2_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
              { id: 'sp1w2_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'sp_p2',
        name: 'Progresión',
        weeks: [3, 4],
        description: 'Aumentamos la duración y añadimos contracciones rápidas.',
        tip: 'Mantén el nivel máximo de contracción durante todo el hold.',
        weeklySchedule: [
          {
            week: 3,
            sessions: [
              { id: 'sp2w3_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'sp2w3_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 2, relaxSeconds: 2, reps: 15 }] },
              { id: 'sp2w3_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
          {
            week: 4,
            sessions: [
              { id: 'sp2w4_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'sp2w4_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 2, relaxSeconds: 2, reps: 15 }] },
              { id: 'sp2w4_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'sp_p3',
        name: 'Volumen',
        weeks: [5, 6],
        description: 'Más volumen, ejercicio compuesto y contracciones rápidas.',
        tip: 'Combina esta rutina con 10 minutos de caminata diaria. El ejercicio aeróbico potencia los beneficios vasculares.',
        weeklySchedule: [
          {
            week: 5,
            sessions: [
              { id: 'sp3w5_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
              { id: 'sp3w5_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 },
                { exerciseId: 'bridge_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 8, prepareSeconds: 5 },
              ] },
              { id: 'sp3w5_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
            ],
          },
          {
            week: 6,
            sessions: [
              { id: 'sp3w6_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
              { id: 'sp3w6_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 },
                { exerciseId: 'bridge_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 8, prepareSeconds: 5 },
              ] },
              { id: 'sp3w6_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'sp_p4',
        name: 'Intensificación',
        weeks: [7, 9],
        description: 'Contracciones máximas con ejercicios compuestos y elevador.',
        tip: 'La secuencia long_holds → bridge_kegel en la misma sesión potencia el estímulo vascular.',
        weeklySchedule: [
          {
            week: 7,
            sessions: [
              { id: 'sp4w7_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'sp4w7_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'bridge_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 10, prepareSeconds: 5 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 8, levels: 4 },
              ] },
              { id: 'sp4w7_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 8,
            sessions: [
              { id: 'sp4w8_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'sp4w8_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'bridge_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 10, prepareSeconds: 5 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 8, levels: 4 },
              ] },
              { id: 'sp4w8_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 9,
            sessions: [
              { id: 'sp4w9_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'sp4w9_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'bridge_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 10, prepareSeconds: 5 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 8, levels: 4 },
              ] },
              { id: 'sp4w9_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'sp_p5',
        name: 'Consolidación',
        weeks: [10, 12],
        description: 'Programa completo con máxima intensidad. Incluye isométrico y reverse kegel para equilibrio.',
        tip: 'En esta fase los resultados suelen ser más notorios. Mantén la consistencia.',
        weeklySchedule: [
          {
            week: 10,
            sessions: [
              { id: 'sp5w10_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'sp5w10_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'bridge_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10, prepareSeconds: 5 },
                { exerciseId: 'isometric_hold', contractSeconds: 3, relaxSeconds: 3, reps: 5, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 5 },
              ] },
              { id: 'sp5w10_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 11,
            sessions: [
              { id: 'sp5w11_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'sp5w11_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'bridge_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10, prepareSeconds: 5 },
                { exerciseId: 'isometric_hold', contractSeconds: 3, relaxSeconds: 3, reps: 5, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 5 },
              ] },
              { id: 'sp5w11_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 12,
            sessions: [
              { id: 'sp5w12_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'sp5w12_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'bridge_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10, prepareSeconds: 5 },
                { exerciseId: 'isometric_hold', contractSeconds: 3, relaxSeconds: 3, reps: 5, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 5 },
              ] },
              { id: 'sp5w12_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
        ],
      },
    ],
  },

  // ───── PLAN 4: Control eyaculatorio (12 semanas) ─────
  {
    id: 'ejaculation_control',
    name: 'Control eyaculatorio',
    tagline: 'Domina el momento',
    shortDescription: 'Domina el control sobre tu reflejo eyaculatorio.',
    description: 'Combina fortalecimiento y relajación consciente para desarrollar control neuromuscular sobre el reflejo eyaculatorio. El Kegel inverso es protagonista en este plan.',
    objective: 'premature_ejaculation',
    totalWeeks: 12,
    level: 'beginner_to_advanced',
    sessionsPerDay: 3,
    icon: 'tune',
    colorClass: 'bg-secondary-container text-on-secondary-container',
    accentColor: '#9C27B0',
    benefit: 'Control eyaculatorio',
    medicalWarning: null,
    phases: [
      {
        id: 'ec_p1',
        name: 'Activación',
        weeks: [1, 2],
        description: 'Encuentra el músculo correcto e introduce el Kegel inverso desde el inicio.',
        tip: 'El Kegel inverso es el antídoto: cuando sientas que te acercas al punto de no retorno, empuja hacia afuera en lugar de apretar.',
        weeklySchedule: [
          {
            week: 1,
            sessions: [
              { id: 'ec1w1_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
              { id: 'ec1w1_a', label: 'Tarde', exercises: [{ exerciseId: 'reverse_kegel', contractSeconds: 3, relaxSeconds: 3, reps: 5 }] },
              { id: 'ec1w1_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
            ],
          },
          {
            week: 2,
            sessions: [
              { id: 'ec1w2_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
              { id: 'ec1w2_a', label: 'Tarde', exercises: [{ exerciseId: 'reverse_kegel', contractSeconds: 3, relaxSeconds: 3, reps: 5 }] },
              { id: 'ec1w2_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'ec_p2',
        name: 'Conciencia',
        weeks: [3, 4],
        description: 'Aumenta la duración y añade contracciones rápidas junto al reverse kegel.',
        tip: 'La relajación es tan importante como la contracción. Asegúrate de soltar completamente entre reps.',
        weeklySchedule: [
          {
            week: 3,
            sessions: [
              { id: 'ec2w3_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'ec2w3_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 15 },
                { exerciseId: 'reverse_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 8 },
              ] },
              { id: 'ec2w3_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
          {
            week: 4,
            sessions: [
              { id: 'ec2w4_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'ec2w4_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 15 },
                { exerciseId: 'reverse_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 8 },
              ] },
              { id: 'ec2w4_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'ec_p3',
        name: 'Control bidireccional',
        weeks: [5, 6],
        description: 'Introduces el elevador y aumentas el reverse kegel. Control en ambas direcciones.',
        tip: 'Practica alternar entre contracción y relajación activa. Ese es el control bidireccional real.',
        weeklySchedule: [
          {
            week: 5,
            sessions: [
              { id: 'ec3w5_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
              { id: 'ec3w5_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 8, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 8 },
              ] },
              { id: 'ec3w5_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
            ],
          },
          {
            week: 6,
            sessions: [
              { id: 'ec3w6_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
              { id: 'ec3w6_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 8, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 8 },
              ] },
              { id: 'ec3w6_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'ec_p4',
        name: 'Intensificación',
        weeks: [7, 9],
        description: 'Máximas contracciones, elevador avanzado y reverse kegel largo.',
        tip: 'En esta fase puedes empezar a practicar el control en situaciones reales. El músculo ya responde.',
        weeklySchedule: [
          {
            week: 7,
            sessions: [
              { id: 'ec4w7_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'ec4w7_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'elevator', contractSeconds: 3, relaxSeconds: 2, reps: 8, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10 },
              ] },
              { id: 'ec4w7_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 8,
            sessions: [
              { id: 'ec4w8_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'ec4w8_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'elevator', contractSeconds: 3, relaxSeconds: 2, reps: 8, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10 },
              ] },
              { id: 'ec4w8_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 9,
            sessions: [
              { id: 'ec4w9_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'ec4w9_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'elevator', contractSeconds: 3, relaxSeconds: 2, reps: 8, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10 },
              ] },
              { id: 'ec4w9_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'ec_p5',
        name: 'Maestría',
        weeks: [10, 12],
        description: 'Combinas fuerza, velocidad, isométrico y relajación activa en una sola sesión.',
        tip: 'El músculo ya tiene memoria. Practica el control bidireccional en situaciones reales.',
        weeklySchedule: [
          {
            week: 10,
            sessions: [
              { id: 'ec5w10_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'ec5w10_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'isometric_hold', contractSeconds: 3, relaxSeconds: 3, reps: 8, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10 },
              ] },
              { id: 'ec5w10_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 11,
            sessions: [
              { id: 'ec5w11_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'ec5w11_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'isometric_hold', contractSeconds: 3, relaxSeconds: 3, reps: 8, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10 },
              ] },
              { id: 'ec5w11_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 12,
            sessions: [
              { id: 'ec5w12_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'ec5w12_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'isometric_hold', contractSeconds: 3, relaxSeconds: 3, reps: 8, levels: 4 },
                { exerciseId: 'reverse_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 10 },
              ] },
              { id: 'ec5w12_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
        ],
      },
    ],
  },

  // ───── PLAN 5: Post-prostatectomía (16 semanas) ─────
  {
    id: 'post_prostatectomy',
    name: 'Post-prostatectomía',
    tagline: 'Recuperación guiada',
    shortDescription: 'Recuperación guiada tras cirugía de próstata.',
    description: 'Programa suave y progresivo de 16 semanas para recuperar continencia urinaria tras cirugía de próstata. Progresión muy gradual respetando la recuperación quirúrgica.',
    objective: 'post_surgery_recovery',
    totalWeeks: 16,
    level: 'beginner_to_intermediate',
    sessionsPerDay: 2,
    icon: 'shield',
    colorClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    accentColor: '#FF9800',
    benefit: 'Recuperación post-cirugía',
    medicalWarning: 'Iniciar solo tras retirada de catéter y aprobación del urólogo. Si no hay mejora en 2-6 meses, consultar fisioterapeuta de suelo pélvico.',
    phases: [
      {
        id: 'pp_p1',
        name: 'Inicio suave',
        weeks: [1, 2],
        description: 'Contracciones muy suaves post-quirúrgicas. Prioridad: no forzar.',
        tip: 'Sé muy suave. El tejido aún está recuperándose. Si sientes cualquier molestia, detente.',
        weeklySchedule: [
          {
            week: 1,
            sessions: [
              { id: 'pp1w1_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 2, relaxSeconds: 4, reps: 5 }] },
              { id: 'pp1w1_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 2, relaxSeconds: 4, reps: 5 }] },
            ],
          },
          {
            week: 2,
            sessions: [
              { id: 'pp1w2_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 2, relaxSeconds: 4, reps: 5 }] },
              { id: 'pp1w2_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 2, relaxSeconds: 4, reps: 5 }] },
            ],
          },
        ],
      },
      {
        id: 'pp_p2',
        name: 'Progresión suave',
        weeks: [3, 4],
        description: 'Aumento gradual de duración y repeticiones.',
        tip: 'Aumenta solo si no sientes dolor ni molestia.',
        weeklySchedule: [
          {
            week: 3,
            sessions: [
              { id: 'pp2w3_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 8 }] },
              { id: 'pp2w3_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 8 }] },
            ],
          },
          {
            week: 4,
            sessions: [
              { id: 'pp2w4_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 8 }] },
              { id: 'pp2w4_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 3, relaxSeconds: 3, reps: 8 }] },
            ],
          },
        ],
      },
      {
        id: 'pp_p3',
        name: 'Construcción',
        weeks: [5, 6],
        description: 'Contracciones más largas y primeras rápidas.',
        tip: 'Las contracciones rápidas pueden ser nuevas. Empieza con menos intensidad.',
        weeklySchedule: [
          {
            week: 5,
            sessions: [
              { id: 'pp3w5_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'pp3w5_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 2, reps: 10 }] },
              { id: 'pp3w5_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
          {
            week: 6,
            sessions: [
              { id: 'pp3w6_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'pp3w6_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 2, reps: 10 }] },
              { id: 'pp3w6_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'pp_p4',
        name: 'Fortalecimiento',
        weeks: [7, 8],
        description: 'Tres sesiones diarias con mayor volumen.',
        tip: 'Si puedes hacer las 3 sesiones sin fatiga, vas por buen camino.',
        weeklySchedule: [
          {
            week: 7,
            sessions: [
              { id: 'pp4w7_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'pp4w7_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 15 }] },
              { id: 'pp4w7_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
          {
            week: 8,
            sessions: [
              { id: 'pp4w8_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
              { id: 'pp4w8_a', label: 'Tarde', exercises: [{ exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 15 }] },
              { id: 'pp4w8_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 5, relaxSeconds: 5, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'pp_p5',
        name: 'Intensificación',
        weeks: [9, 10],
        description: 'Aumento de duración y volumen de rápidas. Elevador introducido.',
        tip: 'El elevador añade control fino. Si no lo dominas, no te preocupes.',
        weeklySchedule: [
          {
            week: 9,
            sessions: [
              { id: 'pp5w9_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
              { id: 'pp5w9_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 5, levels: 4 },
              ] },
              { id: 'pp5w9_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
            ],
          },
          {
            week: 10,
            sessions: [
              { id: 'pp5w10_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
              { id: 'pp5w10_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 },
                { exerciseId: 'elevator', contractSeconds: 2, relaxSeconds: 2, reps: 5, levels: 4 },
              ] },
              { id: 'pp5w10_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 7, relaxSeconds: 7, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'pp_p6',
        name: 'Consolidación',
        weeks: [11, 12],
        description: 'Máximas contracciones con reverse kegel para equilibrio.',
        tip: 'El reverse kegel previene la hipertonía. Es fundamental en post-cirugía.',
        weeklySchedule: [
          {
            week: 11,
            sessions: [
              { id: 'pp6w11_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'pp6w11_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'reverse_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 5 },
              ] },
              { id: 'pp6w11_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 12,
            sessions: [
              { id: 'pp6w12_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'pp6w12_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 25 },
                { exerciseId: 'reverse_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 5 },
              ] },
              { id: 'pp6w12_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
        ],
      },
      {
        id: 'pp_p7',
        name: 'Mantenimiento',
        weeks: [13, 16],
        description: 'Sesiones de mantenimiento para conservar la fuerza recuperada.',
        tip: 'Mantén la consistencia. Los resultados post-cirugía pueden seguir mejorando hasta 12 meses.',
        weeklySchedule: [
          {
            week: 13,
            sessions: [
              { id: 'pp7w13_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'pp7w13_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'reverse_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 8 },
              ] },
              { id: 'pp7w13_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 14,
            sessions: [
              { id: 'pp7w14_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'pp7w14_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'reverse_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 8 },
              ] },
              { id: 'pp7w14_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 15,
            sessions: [
              { id: 'pp7w15_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'pp7w15_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'reverse_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 8 },
              ] },
              { id: 'pp7w15_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
          {
            week: 16,
            sessions: [
              { id: 'pp7w16_m', label: 'Mañana', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
              { id: 'pp7w16_a', label: 'Tarde', exercises: [
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 30 },
                { exerciseId: 'reverse_kegel', contractSeconds: 7, relaxSeconds: 5, reps: 8 },
              ] },
              { id: 'pp7w16_e', label: 'Noche', exercises: [{ exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 }] },
            ],
          },
        ],
      },
    ],
  },

  // ───── PLAN 6: Mantenimiento (indefinido) ─────
  {
    id: 'maintenance',
    name: 'Mantenimiento',
    tagline: 'Consistencia a largo plazo',
    shortDescription: 'Mantén la fuerza adquirida a largo plazo.',
    description: 'Plan continuo para después de completar cualquier programa. Mantiene la fuerza del suelo pélvico con un volumen reducido y sostenible.',
    objective: 'maintenance',
    totalWeeks: null, // indefinido
    level: 'intermediate',
    sessionsPerDay: 2,
    icon: 'all_inclusive',
    colorClass: 'bg-secondary-container text-on-secondary-container',
    accentColor: '#607D8B',
    benefit: 'Mantenimiento',
    medicalWarning: null,
    phases: [
      {
        id: 'mt_p1',
        name: 'Rutina continua',
        weeks: [1, null], // indefinido
        description: 'Rutina diaria de mantenimiento con ejercicios complementarios.',
        tip: 'La consistencia es la clave. Mejor poco cada día que mucho de vez en cuando.',
        weeklySchedule: [
          {
            week: 1, // se repite cada semana
            sessions: [
              { id: 'mt_m', label: 'Mañana', exercises: [
                { exerciseId: 'long_holds', contractSeconds: 10, relaxSeconds: 10, reps: 10 },
                { exerciseId: 'quick_flicks', contractSeconds: 1, relaxSeconds: 1, reps: 20 },
              ] },
              { id: 'mt_e', label: 'Noche', exercises: [
                { exerciseId: 'reverse_kegel', contractSeconds: 5, relaxSeconds: 5, reps: 5 },
                { exerciseId: 'bridge_kegel', contractSeconds: 10, relaxSeconds: 5, reps: 8, prepareSeconds: 5 },
              ] },
            ],
          },
        ],
      },
    ],
  },
]

// ─────────────────────────────────────────────
// Mapeo de IDs de programas antiguos → nuevos (migración)
// ─────────────────────────────────────────────
const LEGACY_PROGRAM_MAP = {
  control:   'ejaculation_control',
  erection:  'sexual_performance',
  intensity: 'sexual_performance',
}

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

export const useRoutinesStore = defineStore('routines', () => {

  // ─── Migración de datos legacy ──────────────
  const dataVersion = Number(localStorage.getItem('keguel_data_version') || '0')
  if (dataVersion < 2) {
    const oldProgram = localStorage.getItem('keguel_program')
    if (oldProgram && LEGACY_PROGRAM_MAP[oldProgram]) {
      const newId = LEGACY_PROGRAM_MAP[oldProgram]
      localStorage.setItem('keguel_program', newId)

      // Asegurar que la semana cabe en el nuevo programa
      const newProgram = PROGRAMS.find(p => p.id === newId)
      const oldWeek = Number(localStorage.getItem('keguel_week') || '1')
      if (newProgram?.totalWeeks && oldWeek > newProgram.totalWeeks) {
        localStorage.setItem('keguel_week', String(newProgram.totalWeeks))
      }
    }
    localStorage.setItem('keguel_data_version', '2')
  }

  // ─── Estado ──────────────────────────────────
  const _storedProgram = localStorage.getItem('keguel_program')
  const selectedProgramId = ref((_storedProgram && _storedProgram !== 'null') ? _storedProgram : null)
  const currentWeek = ref(Number(localStorage.getItem('keguel_week')) || 1)
  const activeSessionIndex = ref(0) // 0=primera sesión del día

  const selectedProgram = computed(() =>
    PROGRAMS.find(p => p.id === selectedProgramId.value) ?? null
  )

  // Fase activa según la semana actual
  const activePhase = computed(() => {
    if (!selectedProgram.value) return null
    return selectedProgram.value.phases.find(phase => {
      const [from, to] = phase.weeks
      // Para plan indefinido, to puede ser null
      if (to === null) return currentWeek.value >= from
      return currentWeek.value >= from && currentWeek.value <= to
    }) ?? selectedProgram.value.phases.at(-1)
  })

  // Schedule de la semana actual dentro de la fase activa
  const currentWeekSchedule = computed(() => {
    if (!activePhase.value?.weeklySchedule) return null
    // Buscar el schedule exacto de esta semana
    const exact = activePhase.value.weeklySchedule.find(ws => ws.week === currentWeek.value)
    if (exact) return exact
    // Para plan de mantenimiento (indefinido), usar el primer schedule como template
    if (selectedProgram.value?.totalWeeks === null) {
      return activePhase.value.weeklySchedule[0] ?? null
    }
    // Fallback: último schedule de la fase
    return activePhase.value.weeklySchedule.at(-1) ?? null
  })

  // Sesiones del día actual
  const todaySessions = computed(() =>
    currentWeekSchedule.value?.sessions ?? []
  )

  // Sesión activa (seleccionada por el usuario)
  const activeSession = computed(() =>
    todaySessions.value[activeSessionIndex.value] ?? todaySessions.value[0] ?? null
  )

  // Lista de ejercicios de la sesión activa
  const activeExercises = computed(() =>
    activeSession.value?.exercises ?? []
  )

  // Ejercicio activo (para el timer) — el primero de la sesión activa por defecto
  const activeExerciseIndex = ref(0)
  const activeExercise = computed(() =>
    activeExercises.value[activeExerciseIndex.value] ?? activeExercises.value[0] ?? null
  )

  // Config compatible con el timer del session store
  const activeRoutineConfig = computed(() => {
    const ex = activeExercise.value
    if (!ex) return null
    const exerciseMeta = EXERCISES.find(e => e.id === ex.exerciseId)
    return {
      name:            `${selectedProgram.value?.name} · Semana ${currentWeek.value}`,
      exerciseId:      ex.exerciseId,
      exerciseName:    exerciseMeta?.name ?? ex.exerciseId,
      reps:            ex.reps,
      contractSeconds: ex.contractSeconds,
      restSeconds:     ex.relaxSeconds,
      reverseSeconds:  ex.exerciseId === 'reverse_kegel' ? ex.contractSeconds : 0,
      levels:          ex.levels ?? 0,
      prepareSeconds:  ex.prepareSeconds ?? 0,
      type:            ex.exerciseId,
    }
  })

  // ─── Acciones ────────────────────────────────

  function selectProgram(id) {
    selectedProgramId.value = id
    currentWeek.value       = 1
    activeSessionIndex.value = 0
    activeExerciseIndex.value = 0
    localStorage.setItem('keguel_program', id)
    localStorage.setItem('keguel_week', '1')
  }

  function resetProgram() {
    selectedProgramId.value = null
    currentWeek.value       = 1
    activeSessionIndex.value = 0
    activeExerciseIndex.value = 0
    localStorage.removeItem('keguel_program')
    localStorage.setItem('keguel_week', '1')
  }

  function setActiveSession(index) {
    activeSessionIndex.value = index
    activeExerciseIndex.value = 0
  }

  function setActiveExercise(index) {
    activeExerciseIndex.value = index
  }

  function nextExercise() {
    if (activeExerciseIndex.value < activeExercises.value.length - 1) {
      activeExerciseIndex.value++
      return true
    }
    return false
  }

  // ─── Progresión semanal ──────────────────────

  const MIN_SESSIONS_TO_ADVANCE = 2

  function weekSessionCount(history) {
    const now    = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 7)

    return history.filter(s => {
      const d = new Date(s.date)
      return d >= monday && d < sunday
    }).length
  }

  const canAdvanceWeek = computed(() => false)

  function advanceWeek() {
    const maxWeek = selectedProgram.value?.totalWeeks
    // Para plan indefinido (maxWeek === null), siempre avanza
    if (maxWeek === null || currentWeek.value < maxWeek) {
      currentWeek.value++
      localStorage.setItem('keguel_week', String(currentWeek.value))
    }
  }

  function tryAdvanceWeek(history) {
    const count = weekSessionCount(history)
    const maxWeek = selectedProgram.value?.totalWeeks
    const canAdvance = maxWeek === null || currentWeek.value < maxWeek

    if (count >= MIN_SESSIONS_TO_ADVANCE && canAdvance) {
      advanceWeek()
      return { advanced: true, sessionsThisWeek: count, required: MIN_SESSIONS_TO_ADVANCE }
    }
    return { advanced: false, sessionsThisWeek: count, required: MIN_SESSIONS_TO_ADVANCE }
  }

  return {
    PROGRAMS,
    EXERCISES,
    selectedProgramId, selectedProgram, currentWeek,
    activePhase, currentWeekSchedule,
    todaySessions, activeSession, activeSessionIndex,
    activeExercises, activeExercise, activeExerciseIndex,
    activeRoutineConfig,
    selectProgram, resetProgram, advanceWeek, tryAdvanceWeek,
    setActiveSession, setActiveExercise, nextExercise,
    MIN_SESSIONS_TO_ADVANCE, weekSessionCount,
  }
})
