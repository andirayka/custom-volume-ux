import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import type { VolumeResult } from 'react-native-volume-manager';

import { VOLUME_TIMING } from '../constants/volume';
import type { UseVolumeListenerResult, VolumeState } from '../types/volume';

const INITIAL_STATE: VolumeState = {
  level: 0,
  visible: false,
  direction: 'up',
};

/** The hardware volume keys drive the music stream. Ignore everything else. */
const MUSIC_STREAM = 'music';

/** Handle returned by React Native's `setTimeout`. */
type TimerHandle = number;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Subscribes to hardware volume changes and turns them into bar state, while
 * optionally taking the volume keys away from the system.
 *
 * When enabled, the native module hides the system volume UI and takes over the
 * volume keys: it raises/lowers the music stream itself and swallows the key
 * event, so the system HUD never appears and no double-adjustment happens.
 *
 * When disabled the module is told to stop intercepting, so the phone's own
 * volume UI behaves exactly as it normally would.
 *
 * Native code detail that shapes this hook: change events are only emitted when
 * the volume actually changes. Pressing up at maximum volume therefore produces
 * no event at all, so the bar simply holds its last state and fades out.
 */
export function useVolumeListener(): UseVolumeListenerResult {
  const isAndroid = Platform.OS === 'android';

  const [enabled, setEnabledState] = useState(true);
  const [state, setState] = useState<VolumeState>(INITIAL_STATE);
  const [supported, setSupported] = useState(isAndroid);

  const hideTimer = useRef<TimerHandle | null>(null);
  const lastLevel = useRef(0);

  // The volume subscription is installed once and must not be torn down every
  // time the toggle flips, so the change handler reads `enabled` through a ref
  // instead of closing over it.
  const enabledRef = useRef(enabled);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  // Switching the custom UX off hides the bar immediately, in the handler rather
  // than an effect — otherwise the bar could sit on screen next to the phone's
  // own volume UI, and a synchronised setState in an effect triggers a second
  // render pass for no reason.
  const setEnabled = useCallback(
    (next: boolean) => {
      enabledRef.current = next;
      setEnabledState(next);
      if (next) return;

      clearHideTimer();
      setState((previous) =>
        previous.visible ? { ...previous, visible: false } : previous,
      );
    },
    [clearHideTimer],
  );

  useEffect(() => {
    if (!isAndroid) return;

    let cancelled = false;
    let subscription: EmitterSubscription | null = null;

    const reveal = (level: number, direction: VolumeState['direction']) => {
      setState({ level, visible: true, direction });
      clearHideTimer();
      hideTimer.current = setTimeout(() => {
        hideTimer.current = null;
        setState((previous) => ({ ...previous, visible: false }));
      }, VOLUME_TIMING.HOLD_DURATION);
    };

    const handleVolumeChange = (result: VolumeResult) => {
      if (result.type !== undefined && result.type !== MUSIC_STREAM) return;

      const level = clamp01(result.volume);
      const direction = level >= lastLevel.current ? 'up' : 'down';
      lastLevel.current = level;

      // Still track the level while disabled, so the bar is already correct if
      // it is switched back on. Only the reveal is suppressed.
      if (!enabledRef.current) return;
      reveal(level, direction);
    };

    const start = async () => {
      try {
        const { volume } = await VolumeManager.getVolume();
        if (cancelled) return;

        const initial = clamp01(volume);
        lastLevel.current = initial;
        setState((previous) => ({ ...previous, level: initial }));

        subscription = VolumeManager.addVolumeListener(handleVolumeChange);
      } catch {
        // Native module missing (Expo Go) or the call was rejected. The demo
        // still renders; it just cannot drive the bar from hardware keys.
        if (!cancelled) setSupported(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      clearHideTimer();
      subscription?.remove();
    };
  }, [clearHideTimer, isAndroid]);

  // Whether the system volume UI is hidden is a separate concern from the volume
  // subscription, so it gets its own effect. Toggling it does not disturb the
  // subscription above.
  useEffect(() => {
    if (!isAndroid) return;

    VolumeManager.showNativeVolumeUI({ enabled: !enabled }).catch(() => {
      // Losing this means the toggle silently had no effect, which is worth
      // surfacing rather than swallowing.
      setSupported(false);
    });
  }, [enabled, isAndroid]);

  // Hand the volume keys back when the screen goes away, or the rest of the
  // device is left without its own volume UI.
  useEffect(() => {
    if (!isAndroid) return;
    return () => {
      VolumeManager.showNativeVolumeUI({ enabled: true }).catch(() => {
        // Nothing useful to do if the restore fails during teardown.
      });
    };
  }, [isAndroid]);

  return { ...state, enabled, setEnabled, supported };
}
