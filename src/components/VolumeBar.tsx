import { useEffect } from 'react';
import { Animated, StyleSheet, View, useAnimatedValue } from 'react-native';

import {
  VOLUME_COLORS,
  VOLUME_LAYOUT,
  VOLUME_TIMING,
} from '../constants/volume';
import type { VolumeState } from '../types/volume';

export type VolumeBarProps = {
  /** Whether the bar should be on screen. */
  visible: boolean;
  /** Normalized volume level, `0`..`1`. */
  level: number;
  /** Direction of the most recent change; selects which edge pulses. */
  direction: VolumeState['direction'];
};

/**
 * Presentational overlay that replaces the system volume HUD.
 *
 * A translucent scrim guarantees contrast over arbitrary content, a track shows
 * the full range so an empty level still reads as a volume bar, and a white fill
 * communicates the current level. The leading edge pulses briefly on each change
 * so the press direction is visible without adding arrows or colour coding.
 */
export function VolumeBar({ visible, level, direction }: VolumeBarProps) {
  const progress = useAnimatedValue(level);
  const fade = useAnimatedValue(visible ? 1 : 0);
  const pulse = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: level,
      duration: VOLUME_TIMING.FILL_DURATION,
      useNativeDriver: false,
    }).start();
  }, [level, progress]);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: visible ? 1 : 0,
      duration: visible
        ? VOLUME_TIMING.SHOW_DURATION
        : VOLUME_TIMING.HIDE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [fade, visible]);

  useEffect(() => {
    pulse.setValue(1);
    Animated.timing(pulse, {
      toValue: 0,
      duration: VOLUME_TIMING.PULSE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [level, direction, pulse]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const pulseScaleY = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.9],
  });

  const translateY = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [-VOLUME_LAYOUT.SLIDE_DISTANCE, 0],
  });

  const isAtStart = direction === 'down';

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.scrim, { opacity: fade, transform: [{ translateY }] }]}
    >
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]}>
          <Animated.View
            style={[
              styles.pulse,
              { opacity: pulse, transform: [{ scaleY: pulseScaleY }] },
              isAtStart ? styles.pulseAtStart : styles.pulseAtEnd,
            ]}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: VOLUME_LAYOUT.SCRIM_HEIGHT,
    backgroundColor: VOLUME_COLORS.scrim,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  track: {
    height: VOLUME_LAYOUT.BAR_HEIGHT,
    borderRadius: VOLUME_LAYOUT.BAR_HEIGHT / 2,
    backgroundColor: VOLUME_COLORS.track,
  },
  fill: {
    height: '100%',
    borderRadius: VOLUME_LAYOUT.BAR_HEIGHT / 2,
    backgroundColor: VOLUME_COLORS.fill,
  },
  pulse: {
    position: 'absolute',
    top: -VOLUME_LAYOUT.PULSE_OVERHANG,
    width: VOLUME_LAYOUT.PULSE_WIDTH,
    height: VOLUME_LAYOUT.BAR_HEIGHT + VOLUME_LAYOUT.PULSE_OVERHANG * 2,
    borderRadius: VOLUME_LAYOUT.PULSE_WIDTH / 2,
    backgroundColor: VOLUME_COLORS.pulse,
  },
  pulseAtStart: {
    left: 0,
  },
  pulseAtEnd: {
    right: 0,
  },
});
