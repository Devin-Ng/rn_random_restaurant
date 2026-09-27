# RR — Random Restaurant (Hong Kong)

A React Native (TypeScript) app that picks a random Hong Kong restaurant for
you. Filter by region, district, dish type and minimum rating, spin a 3D wheel,
and see the full restaurant card with its signature dish photos.

Backend: [`../express_ts`](../express_ts) (Express + MySQL).

---

## Features

- **Filters** — Hong Kong region, the 18 official districts, ~20 dish types and
  a minimum rating, with a live match count.
- **3D pick** — a WebGL wheel of restaurant cards spins and lands on your pick
  (`/restaurants/random` drives the winner).
- **Detail card** — name, region, district, dish type, rating, review count and
  signature dishes with photos and prices.
- **Effects layer** — the home screen runs in an offline `react-native-webview`
  and uses:
  - [React Three Fiber](https://r3f.docs.pmnd.rs) — the 3D wheel
  - [@shadergradient/react](https://github.com/ruucm/shadergradient) — animated background
  - [liquid-glass-js](https://github.com/dashersw/liquid-glass-js) — glass buttons
  - [liquid-logo](https://github.com/collidingScopes/liquid-logo) — liquid-metal logo (MIT shader)

### Why the effects run in a WebView

`@react-three/fiber/native` needs `expo-gl` or `react-native-webgl`. On a bare
React Native project the only maintained option is `expo-gl`, so the 3D and
shader effects are rendered with the **web** build of React Three Fiber inside a
WebView. This keeps every library genuine and avoids GL compatibility problems.

---

## Getting started

### 1. Start the backend

```bash
cd ../express_ts
corepack pnpm install --frozen-lockfile
# Configure .env privately from .env.template without overwriting an existing file.
corepack pnpm db:inventory  # read-only; review DATABASE_SAFETY_RUNBOOK.md
corepack pnpm start:dev    # http://localhost:8080
```

Do not run the legacy migration or full seed as setup commands. P0 blocks
pending destructive migration 001, and a new database needs the reviewed safe
bootstrap scheduled for RR-010. Existing database data must be preserved.

### 2. Install and run the app

```bash
npm ci                   # committed lockfile; Node 22.23.2 / npm 10.9.8
npm run webview:build     # regenerates src/generated/effectsHtml.ts
npm start                 # Metro
npm run android           # Android emulator / device
```

The API base URL is resolved in `src/api/client.ts`:

| Platform | Host |
| --- | --- |
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |

For a physical device, replace the host with your computer's LAN IP.

> Cleartext HTTP to the dev server works in debug builds: the React Native
> Gradle plugin sets the `usesCleartextTraffic` manifest placeholder for
> debuggable variants.

### Rebuilding the effects bundle

`src/generated/effectsHtml.ts` is generated from `src/webview` and embeds the
whole effects page (scripts + CSS) as a single self-contained HTML string.

```bash
npm run webview:build
```

Edit the effects in `src/webview` — `entry.tsx` (scene), `liquid-logo/logo.ts`
(shader), `home/GlassButtons.ts` (glass buttons), `roulette/Roulette.tsx` (wheel).

## Native compatibility spike (RR-004)

The P0 native dependency set is pinned exactly in `package.json` and
`package-lock.json`:

| Package | Version |
| --- | --- |
| `react-native-reanimated` | `4.7.0` |
| `react-native-worklets` | `0.13.0` |
| `react-native-gesture-handler` | `3.3.0` |
| `@gorhom/bottom-sheet` | `5.2.14` |
| `lucide-react-native` | `1.48.0` |
| `react-native-svg` | `15.15.5` |

This set retains React Native `0.87.1` and React `19.2.3`. npm generated the
lockfile without `--force` or `--legacy-peer-deps`; a clean, isolated
`npm ci --ignore-scripts --no-audit --no-fund` installed 936 packages and
`npm ls --depth=0` completed successfully. The isolated install was used so
validation did not mutate the working tree's existing `node_modules`.

### Required setup

- `android/gradle.properties` already enables the New Architecture and Hermes
  (`newArchEnabled=true`, `hermesEnabled=true`), both required by this stack.
- `App.tsx` wraps the app in `GestureHandlerRootView`.
- `babel.config.js` loads `react-native-worklets/plugin`; keep it last if any
  earlier Babel plugins are added.
- `jest.config.js` uses Reanimated's resolver, Gesture Handler's setup, and a
  local setup file for Reanimated, Bottom Sheet, and SVG test behavior.
- No RR-004-specific Metro customization is required; the standard React Native
  Metro configuration remains unchanged.
- On macOS, run `cd ios && bundle exec pod install && cd ..` after `npm ci` before
  building iOS. Pods and iOS compilation cannot be completed or certified on
  Windows.

### Android autolinking recovery

A successful Gradle build alone does not prove that newly installed native
packages were linked. During the emulator startup investigation, the generated
`android/build/generated/autolinking/autolinking.json` and `PackageList.java`
still listed only Safe Area, Screens, and WebView. Gesture Handler, Reanimated,
Worklets, and SVG were installed in `node_modules` but absent from those files.
This is a concrete native dependency mismatch; the screenshot's render error
may be secondary to an earlier missing-native-module exception.

`android/settings.gradle` now invokes the installed local CLI directly, tracks
npm's installed-tree lockfile and the settings file as autolinking cache inputs,
and refuses a build whose generated configuration omits any of those four
required modules. Registration remains automatic; do not edit generated Java,
CMake files or `node_modules`. This change received static review against the
installed Gradle plugin API; its Android build/runtime result is still pending.

Stop Metro and close the app, start `npm start -- --reset-cache` from this
folder, then run `npm run android` in a second terminal. The changed cache inputs
force autolinking configuration regeneration on the next Gradle configuration.
No app-data reset or uninstall is required. If the new explicit autolinking
error occurs, inspect `node node_modules/@react-native-community/cli/build/bin.js config`
and confirm that the four modules have Android entries. If the rebuilt app
still fails, capture the earliest Metro error and all LogBox entries rather
than only the final `GestureHandlerRootView` render error.

### Development-only manual check

In a development build, use **Native check** on Home to open the compatibility
lab. Both the entry control and the navigator screen registration are guarded
by `__DEV__`; release builds do not register the route or expose the control.
The module is loaded through the guarded development branch rather than a
production import.

Use the visible checklist in the lab and verify all of the following on a real
Android device/emulator and, later, an iOS simulator/device:

1. Open the sheet, close it from both controls, and pan down to close it.
2. Drag the handle and scroll both the page and sheet content.
3. Focus the sheet text input, type, dismiss, and reopen the keyboard.
4. Confirm both the Lucide icons and direct `react-native-svg` icon render.
5. Run the motion check with the OS Reduce motion setting off and on. The
   Reanimated timing config and Bottom Sheet both use `ReduceMotion.System`.
6. Confirm screen-reader labels, focus order, and 44-point minimum controls.

Jest verifies the JavaScript wiring and rendered fixture surface only. Its
native-library mocks do **not** prove native gesture recognition, sheet physics,
keyboard interaction, icon rendering, or reduced-motion behavior. Those items
remain manual runtime checks.

Validation recorded on 2026-09-27:

- isolated `npm ci --ignore-scripts --no-audit --no-fund`: passed (936 packages)
- `npm ls --depth=0`: passed
- Jest: passed (2 suites, 6 tests)
- TypeScript (`tsc --noEmit`): passed
- ESLint: passed
- Android development and minified release Metro bundles: passed; the release
  bundle contains none of the compatibility route/screen markers
- Android native build/runtime: not run; the isolated Linux validation
  environment exposes no `adb`, `ANDROID_HOME`, or `ANDROID_SDK_ROOT`, so it
  cannot connect to the reported Windows emulator or invoke an Android SDK
- iOS pods/build/runtime: not run; no Mac or approved macOS CI runner is
  available

Android debug/release native builds plus the on-device checklist, and iOS pods,
builds, and the same checklist, remain required before RR-004 can be marked
complete.

---

## Project structure

```
scripts/build-webview.mjs     bundles src/webview -> src/generated/effectsHtml.ts
src/
  api/          fetch client and endpoint wrappers
  components/   FilterChip, GlassCard, PrimaryButton, RatingBadge, DishCard, EffectsWebView
  generated/    generated effects HTML (do not edit)
  navigation/   native-stack navigator and route types
  screens/      Home, Filters, Pick, Detail
  store/        zustand filter store
  theme/        colors, spacing, typography
  types/        shared API types
  webview/      effects layer source (bundled separately with esbuild)
```

## Tests and checks

```bash
npm test          # jest
npx tsc --noEmit  # type check
npm run lint      # eslint
```

## Data note

Restaurant names, districts and cuisines are real Hong Kong places. Ratings,
review counts and dish lists are representative demo values, and dish photos
are Unsplash stock images with a per-cuisine fallback placeholder.
