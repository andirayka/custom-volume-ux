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
4. **Keep the native UI toggle and the teardown restore separate.** The
   `enabled` toggle flips `showNativeVolumeUI` while the screen is alive; a
   separate unmount effect always restores it to `enabled: true`. Collapsing
   those two into one effect leaves the device without its own volume UI after
   the user switches the custom UX off.
5. **Toggling must not tear down the volume subscription.** The subscription is
   installed once and reads `enabled` through a ref. Re-subscribing on every
   toggle would drop the current level and re-request it, which is wasted work
   and a source of flicker.
6. **Tune constants, not components.** Timing, layout, and colours live in
   `src/constants/volume.ts`.
7. **Never derive volume state by counting events.** One physical press moves
   the volume two steps, because the native key handler does not distinguish
   key-down from key-up and runs for both. Render the absolute volume the module
   reports; do not accumulate deltas.
8. **Do not add a `TextInput` to the demo screen without expecting interception
   to break.** The key listener sits on the content view, and Android routes key
   events to a focused child first, bypassing it. While a text field is focused
   the system volume HUD returns and the bar stops updating.
9. **Position the overlay with safe-area insets, not a hardcoded offset.** The
   bar reads `insets.top` so it sits below the notification bar on any device.
   A fixed `top` value puts it behind the status bar on phones with a taller
   inset.

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
