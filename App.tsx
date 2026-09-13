import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoryScreen } from './src/screens/StoryScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StoryScreen />
    </SafeAreaProvider>
  );
}
