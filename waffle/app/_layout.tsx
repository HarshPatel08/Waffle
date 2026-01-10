import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { WaffleColors } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';
import { requestPermissions } from '@/notifications';

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
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Request notification permissions on app start
    requestPermissions();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // You can handle foreground notifications here if needed
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      
      // Handle notification tap - navigate to group if it's a group notification
      if (data?.groupId && data?.type === 'group_reminder') {
        // Navigation will be handled by expo-router if needed
        // You can use router.push(`/group/${data.groupId}`) here if you have access to router
      }
    });

    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

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
          <Stack.Screen name="notifications-test" options={{ presentation: 'card', title: 'Test Notifications' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
