# RR — Random Restaurant (Hong Kong)

A React Native (TypeScript) app that picks a random Hong Kong restaurant for
you. Filter by region, district, dish type and minimum rating, spin a 3D wheel,
and see the full restaurant card with its signature dish photos.

Backend: [`../express-typescript`](../express-typescript) (Express + MySQL).

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
cd ../express-typescript
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm start:dev            # http://localhost:8080
```

### 2. Install and run the app

```bash
npm install
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
