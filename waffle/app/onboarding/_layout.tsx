import { Stack } from 'expo-router';
import { WaffleColors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: WaffleColors.white },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="name" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="done" />
    </Stack>
  );
}
