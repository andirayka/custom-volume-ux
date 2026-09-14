import {
  Platform,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
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
  const { level, visible, direction, enabled, setEnabled, supported } =
    useVolumeListener();
  const note = environmentNote(supported);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <StoryBackdrop />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.content}>
          <Text style={styles.kicker}>Volume UX</Text>
          <Text style={styles.title}>Custom volume UX</Text>
          <Text style={styles.body}>
            Press the hardware volume keys. With the switch on, the system HUD
            stays hidden and this bar takes over — the same trick Instagram uses
            on stories.
          </Text>

          {note ? (
            <Text style={styles.note}>{note}</Text>
          ) : (
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>Custom volume UX</Text>
                <Text style={styles.toggleHint}>
                  {enabled
                    ? 'On — the phone’s volume UI is replaced by the bar above.'
                    : 'Off — the phone’s own volume UI is back.'}
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: '#3A3A4A', true: '#5B7FDB' }}
                thumbColor="#FFFFFF"
              />
            </View>
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
    marginBottom: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  toggleHint: {
    color: '#8A8AA8',
    fontSize: 12.5,
    lineHeight: 18,
  },
  note: {
    color: '#FFB4B4',
    fontSize: 13,
    lineHeight: 19,
  },
});
