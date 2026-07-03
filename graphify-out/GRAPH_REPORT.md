# Graph Report - .  (2026-07-03)

## Corpus Check
- Corpus is ~17,899 words - fits in a single context window. You may not need a graph.

## Summary
- 253 nodes · 279 edges · 21 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.55)
- Token cost: 0 input · 19,896 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Training Session Screen|Training Session Screen]]
- [[_COMMUNITY_Profile & Settings|Profile & Settings]]
- [[_COMMUNITY_Program Detail & Progression|Program Detail & Progression]]
- [[_COMMUNITY_Charts & Session Store|Charts & Session Store]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Free Mode|Free Mode]]
- [[_COMMUNITY_App Bootstrap & Routing|App Bootstrap & Routing]]
- [[_COMMUNITY_Session Summary Screen|Session Summary Screen]]
- [[_COMMUNITY_Dev Tooling & Build|Dev Tooling & Build]]
- [[_COMMUNITY_Insights & Streaks|Insights & Streaks]]
- [[_COMMUNITY_Haptics Service|Haptics Service]]
- [[_COMMUNITY_Sound Service|Sound Service]]
- [[_COMMUNITY_Routines & Programs Store|Routines & Programs Store]]
- [[_COMMUNITY_Bottom Navigation|Bottom Navigation]]
- [[_COMMUNITY_Onboarding Flow|Onboarding Flow]]
- [[_COMMUNITY_HTML Entry & Spec Workflow|HTML Entry & Spec Workflow]]

## God Nodes (most connected - your core abstractions)
1. `scripts` - 7 edges
2. `getHaptics()` - 7 edges
3. `webVibrate()` - 6 edges
4. `useSettingsStore` - 4 edges
5. `getContext()` - 4 edges
6. `playTone()` - 4 edges
7. `makeItem()` - 3 edges
8. `vibrateContract()` - 3 edges
9. `vibrateRest()` - 3 edges
10. `vibrateReverse()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Vue App Bootstrap Script` --conceptually_related_to--> `OpenSpec Spec-Driven Workflow`  [INFERRED]
  index.html → openspec/config.yaml

## Import Cycles
- 1-file cycle: `src/stores/haptics.js -> src/stores/haptics.js`

## Communities (21 total, 0 thin omitted)

### Community 0 - "Training Session Screen"
Cohesion: 0.05
Nodes (36): auraColor, countdownKey, countdownValue, currentDay, dashOffset, elapsedFormatted, fastBeat, freeBlockLabel (+28 more)

### Community 1 - "Profile & Settings"
Cohesion: 0.07
Nodes (18): useProfileStore, currentLocaleName, dataMessage, dataMessageError, editingName, fileInput, localeNames, locales (+10 more)

### Community 2 - "Program Detail & Progression"
Cohesion: 0.08
Nodes (16): advanceMessage, canAdvance, confirmBody, confirmButtonText, confirmTitle, hasActiveProgram, isCurrentProgram, program (+8 more)

### Community 3 - "Charts & Session Store"
Cohesion: 0.10
Nodes (13): coach, points, recentAvg, session, { t, locale }, DAY_KEYS, displayedMonday, session (+5 more)

### Community 4 - "Runtime Dependencies"
Cohesion: 0.10
Nodes (19): dependencies, @capacitor/android, @capacitor/core, @capacitor/haptics, @capacitor/local-notifications, pinia, vue, vue-i18n (+11 more)

### Community 5 - "Free Mode"
Cohesion: 0.11
Nodes (16): DEFAULT_DURATION, DEFAULT_ITEMS, defaultDuration(), DURATION_OPTIONS, DURATIONS, LABEL_KEY, makeItem(), nextId() (+8 more)

### Community 6 - "App Bootstrap & Routing"
Cohesion: 0.14
Nodes (9): route, showNav, i18n, app, pinia, router, useNotificationsStore, DEFAULTS (+1 more)

### Community 7 - "Session Summary Screen"
Cohesion: 0.17
Nodes (9): durationMin, effortLevels, last, router, selectedEffort, session, { t }, weekActivity (+1 more)

### Community 8 - "Dev Tooling & Build"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, @capacitor/cli, happy-dom, @playwright/test, postcss, tailwindcss, vite (+3 more)

### Community 9 - "Insights & Streaks"
Cohesion: 0.18
Nodes (9): dayKeys, dayLabels, history, session, streak, { t, locale }, todayIndex, weekActivity (+1 more)

### Community 10 - "Haptics Service"
Cohesion: 0.44
Nodes (8): getHaptics(), isCapacitor(), vibrateComplete(), vibrateContract(), vibrateRest(), vibrateReverse(), vibrateTick(), webVibrate()

### Community 11 - "Sound Service"
Cohesion: 0.36
Nodes (6): contractSound(), getContext(), playTone(), restSound(), reverseSound(), tickSound()

### Community 12 - "Routines & Programs Store"
Cohesion: 0.32
Nodes (4): PROGRAMS, useRoutinesStore, routines, { selectedProgramId }

### Community 13 - "Bottom Navigation"
Cohesion: 0.40
Nodes (3): route, { t }, tabs

### Community 14 - "Onboarding Flow"
Cohesion: 0.50
Nodes (4): finish(), next(), router, step

### Community 15 - "HTML Entry & Spec Workflow"
Cohesion: 0.50
Nodes (4): App Root HTML Entry, Vue App Bootstrap Script, Material Symbols Icon Font, OpenSpec Spec-Driven Workflow

## Knowledge Gaps
- **151 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSettingsStore` connect `App Bootstrap & Routing` to `Haptics Service`, `Sound Service`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling & Build` to `Runtime Dependencies`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Training Session Screen` be split into smaller, more focused modules?**
  _Cohesion score 0.052564102564102565 - nodes in this community are weakly interconnected._
- **Should `Profile & Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Program Detail & Progression` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Charts & Session Store` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._