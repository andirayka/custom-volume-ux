# AGENTS.md

Guidance for AI agents working in this repository. Read this before changing
code.

## What this project is

A React Native demo of **custom hardware volume UX on Android**. It suppresses
Android's system volume HUD and renders its own bar, the way Instagram does
inside Stories. Real device volume still changes; only the visible UI is
replaced.

## Non-negotiables

1. **Expo Go cannot run this project.** `react-native-volume-manager` contains
   native Android code. Use a development build (`npx expo run:android`).
   Never "fix" a linking error by removing the library.
2. **Do not change volume from JavaScript.** The native module already adjusts
   the music stream when it swallows the key event. Calling `setVolume` in
   response would adjust the volume twice per press. Read the reported volume
   and render it.
3. **Android only.** iOS cannot intercept hardware volume keys this way, and
   browsers expose no volume API. Keep non-Android platforms rendering the
   demo with an explanatory note rather than crashing.
4. **Restore the native UI on teardown.** Any code path that hides the system
   volume UI must re-enable it when the screen unmounts, or the rest of the
   device is left with broken volume keys.
5. **Tune constants, not components.** Timing, layout, and colours live in
   `src/constants/volume.ts`.

## Layout

```
App.tsx                        entry point; mounts the screen inside SafeAreaProvider
src/
├── components/VolumeBar.tsx   the overlay — presentation only, no native imports
├── constants/volume.ts        timing, layout, colours
├── hooks/useVolumeListener.ts all native wiring; returns { level, visible, direction, supported }
├── screens/StoryScreen.tsx    full-screen demo surface
└── types/volume.ts            shared types
```

Keep the separation: `VolumeBar` must stay a pure function of its props with no
knowledge of `react-native-volume-manager`. Every library call belongs in the
hook. This is what makes the bar reusable and the native code auditable.

## Conventions

- TypeScript strict. `npm run typecheck` must pass.
- ESLint flat config (`eslint.config.js`) plus Prettier. `npm run lint` must
  pass. React Compiler rules are enabled — notably **never read `ref.current`
  during render**. Use `useAnimatedValue` from `react-native` for animated
  values, not `useRef(new Animated.Value(...))`.
- Import order: external packages first, then internal modules.
- Comments explain _why_, never _what_. Delete any comment that restates the
  line beneath it.

## Verifying changes

```sh
npm run typecheck
npm run lint
npx expo export --platform android   # proves the bundle builds
```

The volume behaviour itself can only be confirmed on a real Android device or
emulator with a development build installed. If you cannot run one, say so
explicitly instead of claiming the interaction works.

## Expo SDK 57

The SDK changes quickly. Read the versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before writing code that touches Expo
APIs, and prefer `npx expo install <pkg>` over `npm install <pkg>` for anything
Expo-managed so versions stay SDK-compatible.
