/**
 * Timing and layout constants for the custom volume bar.
 *
 * Values are intentionally centralized so the feel of the interaction can be
 * tuned in one place instead of hunting through components.
 */

export const VOLUME_TIMING = {
  /** Fade-in when the bar appears. */
  SHOW_DURATION: 150,
  /** Quiet period after the last press before the bar starts hiding. */
  HOLD_DURATION: 800,
  /** Fade-out when the bar disappears. */
  HIDE_DURATION: 300,
  /**
   * Glide between discrete volume steps. Android reports whole steps, so this
   * smooths the jump instead of snapping the fill.
   */
  FILL_DURATION: 140,
  /** Leading-edge direction pulse. */
  PULSE_DURATION: 220,
} as const;

export const VOLUME_LAYOUT = {
  /** Height of the bar itself. */
  BAR_HEIGHT: 4,
  /** Height of the translucent backdrop behind the bar. */
  SCRIM_HEIGHT: 44,
  /** Vertical distance the bar travels while fading in. */
  SLIDE_DISTANCE: 10,
  /** Width of the leading-edge direction pulse marker. */
  PULSE_WIDTH: 3,
  /** How far the pulse marker overhangs the bar, top and bottom. */
  PULSE_OVERHANG: 3,
} as const;

export const VOLUME_COLORS = {
  /** Translucent dark backdrop that guarantees contrast over any content. */
  scrim: 'rgba(0, 0, 0, 0.72)',
  /** Unfilled portion of the bar, so an empty level still reads as a bar. */
  track: 'rgba(255, 255, 255, 0.28)',
  /** Filled portion of the bar. */
  fill: '#FFFFFF',
  /** Leading-edge direction pulse. */
  pulse: '#FFFFFF',
} as const;
