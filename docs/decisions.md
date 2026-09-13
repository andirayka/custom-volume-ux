# Decisions

The reasoning behind the shape of this project. Captured because several of
these were genuine judgement calls, not obvious defaults.

The original design session is preserved at
[`design-session.html`](./design-session.html).

## Why Android only

iOS does not expose hardware volume key presses to apps the way Android does.
You can observe volume _changes_ on iOS, but you cannot swallow the key press
and suppress the system HUD, which is the entire point of this demo. Weakening
the feature to "observe only" would have produced something that looks like the
goal but behaves differently. Scoping to Android keeps the demo honest.

## Why `react-native-volume-manager`

Intercepting volume keys by hand means writing an Android native module. The
library already does it correctly, including the details that are easy to miss:

- it consumes the key event, so the system HUD never appears
- it adjusts the stream itself, so volume is not changed twice
- it re-registers its listener on app resume, and restores focus safely

Reimplementing that would be more code and more bugs for no gain in a project
whose point is the custom UI.

## Why the app does not call `setVolume`

The native module already adjusts the music stream when it swallows the key.
Calling `setVolume` from JavaScript on each event would apply every press twice
and fight the user. The app only ever _reads_ the reported volume. This is the
single most important invariant in the codebase.

## Why hide the native UI for the whole session

`showNativeVolumeUI({ enabled: false })` is set once while the screen is
mounted, rather than per press. Switching it per key press is racy — the key
listener would not reliably be installed when the key arrives. The trade-off is
an obligation: the native UI must be restored on unmount, which the hook does.

## Why a translucent scrim, not a bare bar

A bare bar is invisible over light content. The demo has to be legible over
arbitrary media, so the bar sits on a translucent dark backdrop. That also
matches how these overlays behave in real apps, where the content behind them is
unknown.

## Why the fill animates smoothly over discrete steps

Android reports whole volume steps. Snapping the fill to those steps looks like
a system progress bar; interpolating between them reads as a designed
interaction. The underlying value is still discrete — only the presentation is
smoothed.

## Why the leading edge pulses instead of showing direction

Arrows and colour coding add visual noise and imply meaning (up = good) that
volume does not have. A brief pulse on the edge that moved communicates
direction through motion, which is enough to confirm the press was registered.

## Why `useAnimatedValue` rather than `useRef(new Animated.Value(...))`

React Compiler's lint rules forbid reading `ref.current` during render. Animated
values are read during render to build interpolations, so the ref pattern fails
lint. `useAnimatedValue` is React Native's purpose-built hook for this and keeps
the animated values compiler-safe.

## Why state is one object with a `supported` flag

`level`, `visible`, and `direction` always change together as the result of the
same event, so they are one unit of state. `supported` is separate in origin —
it reflects whether the native module is available — and lets the screen explain
itself on platforms where the demo cannot work, instead of rendering a bar that
never moves.
