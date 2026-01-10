import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { WaffleColors } from '@/constants/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={styles.tabIconEmoji}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: WaffleColors.carbonBlack,
        tabBarInactiveTintColor: WaffleColors.charcoal,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: WaffleColors.white,
          borderTopWidth: 2,
          borderTopColor: WaffleColors.dustGrey,
          height: 80,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: WaffleColors.yellow,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
  },
  tabIconEmoji: {
    fontSize: 20,
  },
});
