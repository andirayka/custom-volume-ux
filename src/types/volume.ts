/**
 * Shared types for the custom volume UX.
 */

/** Direction of the most recent volume change. */
export type VolumeDirection = 'up' | 'down';

/** Snapshot of the volume state that the UI renders from. */
export type VolumeState = {
  /** Normalized volume level, `0`..`1`. */
  level: number;
  /** Whether the custom bar should currently be on screen. */
  visible: boolean;
  /** Direction of the most recent change; drives the leading-edge pulse. */
  direction: VolumeDirection;
};

/** What `useVolumeListener` hands back to a screen. */
export type UseVolumeListenerResult = VolumeState & {
  /**
   * `false` when hardware volume interception is unavailable — non-Android
   * platforms, or a build where the native module is not linked (for example
   * Expo Go, which cannot run this project).
   */
  supported: boolean;
};
