import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { WaffleColors } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';

// Custom theme based on Waffle colors
const WaffleTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: WaffleColors.yellow,
    background: WaffleColors.white,
    card: WaffleColors.white,
    text: WaffleColors.carbonBlack,
    border: WaffleColors.dustGrey,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={WaffleTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: WaffleColors.white },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="group/[id]" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
