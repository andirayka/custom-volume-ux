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
 * Subscribes to hardware volume changes and turns them into bar state.
 *
 * On Android, hiding the native volume UI makes the native module take over the
 * volume keys: it raises/lowers the music stream itself and swallows the key
 * event, so the system HUD never appears and no double-adjustment happens.
 *
 * Native code detail that shapes this hook: change events are only emitted when
 * the volume actually changes. Pressing up at maximum volume therefore produces
 * no event at all, so the bar simply holds its last state and fades out.
 */
export function useVolumeListener(): UseVolumeListenerResult {
  const isAndroid = Platform.OS === 'android';

  const [state, setState] = useState<VolumeState>(INITIAL_STATE);
  const [supported, setSupported] = useState(isAndroid);

  const hideTimer = useRef<TimerHandle | null>(null);
  const lastLevel = useRef(0);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

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
      reveal(level, direction);
    };

    const start = async () => {
      try {
        const { volume } = await VolumeManager.getVolume();
        if (cancelled) return;

        const initial = clamp01(volume);
        lastLevel.current = initial;
        setState((previous) => ({ ...previous, level: initial }));

        await VolumeManager.showNativeVolumeUI({ enabled: false });
        if (cancelled) return;

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

      // Hand the volume keys back so the rest of the device behaves normally
      // once this screen goes away.
      VolumeManager.showNativeVolumeUI({ enabled: true }).catch(() => {
        // Nothing useful to do if the restore fails during teardown.
      });
    };
  }, [clearHideTimer, isAndroid]);

  return { ...state, supported };
}
