# Plan: RR — Hong Kong Random Restaurant Picker

A React Native (TypeScript) app that randomly picks a restaurant in Hong Kong.
Users filter by region / district / dish type / minimum rating, spin a 3D picker,
and see full restaurant details.

---

## 1. Confirmed decisions

| Topic | Choice |
|---|---|
| App framework | Bare React Native CLI + TypeScript (RN 0.87.x) in `C:\Users\devinng\Desktop\Project\RR` |
| Backend | Extend existing `express-typescript` (Express 5 + zod + mysql2, port 8080) |
| Data | Curated demo dataset: ~150-200 real famous HK restaurants, all 18 districts, synthetic ratings/review counts, Unsplash CDN dish photos |
| UI modules | Hybrid: native RN screens + one WebView "effects layer" using all 4 modules |
| Photos | Remote Unsplash CDN URLs stored in DB, with per-cuisine fallback placeholder |

### UI module integration

| Module | Where it lives | Role |
|---|---|---|
| React Three Fiber (web build + three.js) | WebView bundle | 3D glass-card roulette for the random pick |
| shadergradient (`@shadergradient/react`) | WebView bundle | Animated gradient app background |
| liquid-glass-js | WebView bundle (vendored) | Liquid glass "Pick" / navigation buttons |
| liquid-logo (GLSL fragment shader, MIT) | WebView bundle | Liquid-metal animation for the app logo |

> Why WebView for R3F: on bare RN, `@react-three/fiber/native` requires
> `expo-gl` or `react-native-webgl`. `react-native-webgl` has not shipped since
> 2022 and is incompatible with modern RN. Running the web build of R3F inside
> `react-native-webview` uses the real library with zero GL compatibility risk.

---

## 2. Hong Kong data model

4 regions -> 18 official districts:

- **Hong Kong Island**: Central & Western, Eastern, Southern, Wan Chai
- **Kowloon**: Yau Tsim Mong, Sham Shui Po, Kowloon City, Wong Tai Sin, Kwun Tong
- **New Territories East**: North, Tai Po, Sha Tin, Sai Kung
- **New Territories West**: Islands, Kwai Tsing, Tsuen Wan, Tuen Mun, Yuen Long

Normalized dish types (~20): Cantonese, Dim Sum, Cha Chaan Teng, Seafood,
Hot Pot, Noodles, Street Food, Bakery/Dessert, Japanese, Ramen, Sushi, Thai,
Vietnamese, Korean, Sichuan, Shanghainese, Taiwanese, Indian, Italian,
French, Cafe/Western.

---

## 3. Backend work (`express-typescript`)

### 3.1 Migration — `database/migrations/001_hk_schema.sql`

- `restaurants`: add `district VARCHAR(100)`; indexes on `region`, `district`,
  `dish_type`, `rating`.
- `main_dishes`: add `photo_url VARCHAR(500)`.
- Remove placeholder test row (`Sakura Ramen / Midtown`).

### 3.2 Seed — `database/seed/hk_restaurants.sql` + `db:seed` npm script

- Real famous restaurants per district (Tim Ho Wan, Lung King Heen, Kau Kee,
  Yung Kee, Ho Lee Fook, Mak Man Kee, Australia Dairy Co., Joy Hing,
  Kung Wo Tong, ...).
- 1-3 signature dishes each with price and Unsplash photo URL.
- Deterministic, re-runnable (TRUNCATE + INSERT).

### 3.3 Endpoints (existing controller -> service -> repository -> zod -> OpenAPI pattern)

- `GET /restaurants` — optional filters `region`, `district`, `dishType`, `minRating`
- `GET /restaurants/random` — same filters, server-side `ORDER BY RAND() LIMIT 1`
- `GET /restaurants/:id` — include `district`
- `GET /restaurants/:id/dishes` — include `photoUrl`
- `GET /meta/filters` — regions, districts-by-region, dishTypes
- Vitest tests updated/added for the new behavior.

---

## 4. Mobile app (`RR/`)

```
src/
  api/          client.ts (10.0.2.2:8080 Android / localhost iOS), restaurants.ts, meta.ts
  types/        Restaurant.ts, Filters.ts
  navigation/   RootStack: Home -> Filters -> Pick -> Detail
  screens/      HomeScreen, FilterScreen, PickScreen, DetailScreen
  components/   RegionPicker, DistrictChips, DishTypeChips, RatingSlider,
                RestaurantCard, DishCard, EffectsWebView
  webview/      index.html + esbuild bundle
                effects.*  -> ShaderGradient bg, liquid-glass-js buttons, liquid-logo shader
                r3f-scene  -> R3F web Canvas roulette
  store/        zustand filter state
  theme/        colors, spacing, typography
```

Dependencies: `@react-navigation/native`, `@react-navigation/native-stack`,
`react-native-screens`, `react-native-safe-area-context`,
`react-native-webview`, `zustand`.

WebView bundle is served from app assets (`android_asset` on Android, iOS
resources) and communicates with RN via `postMessage` / `injectJavaScript`.

### Flow

1. **Home** — ShaderGradient animated background + liquid-metal logo + liquid
   glass "Pick" / "Filters" buttons.
2. **Filters** (native) — region -> dependent district chips, dish-type
   multi-select, min-rating slider, live match count from API.
3. **Pick** — WebView R3F roulette loaded with candidate names; spin with
   damping; winner posted back to RN.
4. **Detail** (native) — Name, Region, District, Dish type, Rating
   (+reviewCount), main dishes with prices and photos; "Pick again" /
   "Adjust filters".

---

## 5. Milestones

1. **M1 Backend** — migration + seed + endpoints + tests; verify via curl/Swagger.
2. **M2 App core** — scaffold, navigation, API client, Filters + Detail screens.
3. **M3 Effects layer** — WebView home (shadergradient + liquid glass + liquid logo).
4. **M4 Pick scene** — R3F roulette + result flow.
5. **M5 Polish** — WebView prewarm, pixelRatio cap, native fallback spinner,
   cleartext-HTTP dev config, README.

---

## 6. Risks / mitigations

| Risk | Mitigation |
|---|---|
| WebView WebGL performance | Simple scene, capped pixel ratio, native 2D fallback spin |
| Unsplash URL breakage | `onError` placeholder per cuisine |
| Demo ratings/dishes are synthetic | Documented in README (names/locations/cuisines real) |
| Android cleartext HTTP to dev server | `usesCleartextTraffic` dev flag |
| WebView asset loading differs iOS/Android | Documented setup + dev-server fallback in debug |
