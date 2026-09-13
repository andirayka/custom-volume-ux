# Custom Volume UX

A React Native playground for **custom hardware volume UX on Android**.

Pressing the phone's volume keys normally makes Android pop up its own volume
slider. This project suppresses that system UI and renders a custom bar instead —
the same trick Instagram uses inside Stories. The real device volume still
changes; only the visible UI is replaced.

<!-- Add a screen recording here when one is available. -->

## What it does

- Intercepts the hardware volume keys on Android and hides the system HUD.
- Shows a slim white bar pinned to the top of the screen, on a translucent
  backdrop that stays readable over any content.
- Fills and empties smoothly as volume changes, instead of snapping between
  steps.
- Pulses the leading edge of the bar so you can see which way you pressed.

## Why a development build

Expo Go cannot run this project. `react-native-volume-manager` ships native
Android code that must be compiled into the app, and the whole point of the demo
is overriding the volume keys at the native level.

```sh
npm install
npx expo run:android   # compiles a development build and installs it
```

Once the development build is installed, day-to-day work is normal Expo:

```sh
npx expo start
```

Rebuild the native app only after adding a library with native code, changing
`app.json`, or upgrading the Expo SDK:

```sh
npx expo prebuild --clean
npx expo run:android
```

## Scripts

| Script                 | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `npm start`            | Start the Expo dev server                 |
| `npm run android`      | Compile and install the development build |
| `npm run typecheck`    | TypeScript, no emit                       |
| `npm run lint`         | ESLint (flat config, Expo + Prettier)     |
| `npm run format`       | Prettier write                            |
| `npm run format:check` | Prettier check, no write                  |

## How it works

The native module takes over the volume keys while the app is in the foreground.
It raises or lowers the music stream itself and swallows the key event, so
Android never shows its own slider and the volume is not adjusted twice. The
module then reports each change back to JavaScript, where the bar reacts.

That means there is no JavaScript-side volume math to get wrong: the app reads
the resulting volume and draws it.

```
volume key press
  └─ native module swallows the key, adjusts the music stream
       └─ reports the new volume to JavaScript
            └─ useVolumeListener updates state
                 └─ VolumeBar animates
```

### Native behaviour worth knowing

Three details of the underlying library explain how the demo behaves. They are
recorded because each one looks like a bug until you know where it comes from.

**Change events only fire when the volume actually changes.** Holding volume-up
at maximum volume produces no event at all, so the bar holds its last state and
fades out. Freezing at the edge is a consequence of the native behaviour rather
than something the UI special-cases.

**One press moves the volume two steps.** The library's key handler never checks
whether the key event is a press or a release, so both the down and up events for
a single physical press run the same code. The volume therefore moves by two
steps per press. The UI is unaffected because the bar renders absolute volume
rather than counting presses — which is worth preserving if you change the hook.

**Interception stops while a text field has focus.** The key listener sits on the
content view, and Android forwards key events to a focused child first, bypassing
that listener. If you add a `TextInput`, the system volume HUD comes back while it
is focused and the bar stops updating. The library works around this by
restoring focus to the content view when focus leaves an input, but it cannot
intercept while one is focused.

## Project structure

```
App.tsx                        entry point; mounts the screen
src/
├── components/
│   └── VolumeBar.tsx          the overlay — presentation only
├── constants/
│   └── volume.ts              timing, layout, and colours in one place
├── hooks/
│   └── useVolumeListener.ts   native subscription → bar state
├── screens/
│   └── StoryScreen.tsx        full-screen demo surface
└── types/
    └── volume.ts              shared types
```

The split matters: all native wiring lives in the hook, and the bar is a pure
function of its props. That keeps the library-specific code in one file instead
of leaking through the UI.

## Tuning the feel

Every timing, size, and colour lives in `src/constants/volume.ts`. Want a longer
linger after you stop pressing, a thicker bar, or a different backdrop? Change
the constant; no component edits needed.

## Platform support

Android only. On iOS the hardware volume keys are not interceptable this way, and
browsers expose no volume API at all. On those platforms the demo still renders
and shows a note explaining why the bar will not move.

## License

MIT
