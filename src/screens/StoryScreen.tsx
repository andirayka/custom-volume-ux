import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VolumeBar } from '../components/VolumeBar';
import { useVolumeListener } from '../hooks/useVolumeListener';

/**
 * Explains the one situation where the demo cannot work: hardware volume
 * interception is Android-only, and the native module needs a development build
 * because Expo Go cannot host it.
 */
function environmentNote(supported: boolean): string | null {
  if (Platform.OS !== 'android') {
    return 'Hardware volume interception is Android-only. Open this project on an Android device or emulator.';
  }
  if (!supported) {
    return 'Native volume module unavailable. This project needs a development build — Expo Go cannot host it. Run `npx expo run:android`.';
  }
  return null;
}

/**
 * Stand-in for full-screen media, so the custom volume bar has real content to
 * sit on top of instead of an empty background.
 */
function StoryBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.band, styles.bandOne]} />
      <View style={[styles.band, styles.bandTwo]} />
      <View style={[styles.band, styles.bandThree]} />
    </View>
  );
}

export function StoryScreen() {
  const { level, visible, direction, supported } = useVolumeListener();
  const note = environmentNote(supported);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <StoryBackdrop />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.content}>
          <Text style={styles.kicker}>Nulis</Text>
          <Text style={styles.title}>Custom volume UX</Text>
          <Text style={styles.body}>
            Press the hardware volume keys. The system HUD stays hidden and this
            bar takes over — the same trick Instagram uses on stories.
          </Text>
          {note ? (
            <Text style={styles.note}>{note}</Text>
          ) : (
            <Text style={styles.hint}>
              Volume up fills the bar, volume down empties it. The leading edge
              pulses in the direction you pressed.
            </Text>
          )}
        </View>
      </SafeAreaView>

      <VolumeBar visible={visible} level={level} direction={direction} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07070A',
  },
  band: {
    flex: 1,
  },
  bandOne: {
    backgroundColor: '#12122B',
  },
  bandTwo: {
    backgroundColor: '#1B1440',
  },
  bandThree: {
    backgroundColor: '#0C1030',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  kicker: {
    color: '#8A8AA8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    color: '#C9C9DB',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  hint: {
    color: '#7C7C99',
    fontSize: 13,
    lineHeight: 19,
  },
  note: {
    color: '#FFB4B4',
    fontSize: 13,
    lineHeight: 19,
  },
});
