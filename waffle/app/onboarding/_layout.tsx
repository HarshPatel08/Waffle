import { Stack } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { OnboardingProvider } from '@/context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: WaffleColors.white },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="name" />
        <Stack.Screen name="email" />
        <Stack.Screen name="password" />
        <Stack.Screen name="done" />
      </Stack>
    </OnboardingProvider>
  );
}
