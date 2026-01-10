/**
 * Example usage of the notification system
 * 
 * This file demonstrates how to use the notification service
 * for scheduling recurring notifications based on user and group settings.
 */

import {
  scheduleGroupNotification,
  scheduleNotificationsFromSettings,
  updateGroupNotificationSchedule,
  cancelGroupNotifications,
  cancelAllNotifications,
  createDefaultUserSettings,
  type UserNotificationSettings,
  type NotificationSchedule,
  type GroupNotificationSettings,
} from './Notifications';

// Example 1: Schedule a daily notification for a group at 8:00 PM
export async function example1_DailyGroupNotification() {
  const schedule: NotificationSchedule = {
    time: '20:00', // 8:00 PM daily
  };

  const notificationId = await scheduleGroupNotification(
    'group-1',
    'College Roomies',
    schedule,
    'Time to share your daily vlog! 🎬'
  );

  console.log('Scheduled notification ID:', notificationId);
}

// Example 2: Schedule a weekly notification (specific days)
export async function example2_WeeklyGroupNotification() {
  const schedule: NotificationSchedule = {
    time: '18:00', // 6:00 PM
    daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday (0 = Sunday, 1 = Monday, etc.)
  };

  const notificationId = await scheduleGroupNotification(
    'group-2',
    'Work Besties',
    schedule,
    'Weekly check-in time! 💼'
  );

  console.log('Scheduled notification IDs:', notificationId);
}

// Example 3: Set up notifications from user settings
export async function example3_UserSettingsNotifications() {
  const userSettings: UserNotificationSettings = {
    enabled: true,
    defaultSchedule: {
      time: '19:00', // Default: 7:00 PM daily
    },
    groupSchedules: [
      {
        groupId: 'group-1',
        groupName: 'College Roomies',
        enabled: true,
        schedule: {
          time: '20:00', // 8:00 PM daily for this group
        },
      },
      {
        groupId: 'group-2',
        groupName: 'Work Besties',
        enabled: true,
        schedule: {
          time: '18:00',
          daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        },
      },
      {
        groupId: 'group-3',
        groupName: 'Family',
        enabled: false, // Disabled for this group
        schedule: {
          time: '17:00',
        },
      },
    ],
  };

  const notificationIds = await scheduleNotificationsFromSettings(userSettings);
  console.log('Scheduled notification IDs:', notificationIds);
}

// Example 4: Update a group's notification schedule
export async function example4_UpdateGroupSchedule() {
  const newSchedule: NotificationSchedule = {
    time: '21:00', // Change to 9:00 PM
    daysOfWeek: [0, 6], // Sunday and Saturday only
  };

  const success = await updateGroupNotificationSchedule(
    'group-1',
    'College Roomies',
    newSchedule
  );

  console.log('Update successful:', success);
}

// Example 5: Disable notifications for a specific group
export async function example5_DisableGroupNotifications() {
  // Pass null to disable
  await updateGroupNotificationSchedule('group-1', 'College Roomies', null);
}

// Example 6: Cancel all notifications
export async function example6_CancelAllNotifications() {
  await cancelAllNotifications();
  console.log('All notifications cancelled');
}

// Example 7: Create default settings
export function example7_CreateDefaultSettings() {
  const defaultSettings = createDefaultUserSettings();
  console.log('Default settings:', defaultSettings);
  
  // Now you can customize it
  defaultSettings.groupSchedules.push({
    groupId: 'group-1',
    groupName: 'My Group',
    enabled: true,
    schedule: {
      time: '20:00',
    },
  });
}

// Example usage in a React component:
/*
import { useEffect, useState } from 'react';
import { scheduleNotificationsFromSettings, type UserNotificationSettings } from '@/Notifications';
import { groups } from '@/constants/mockData';

export function useNotifications() {
  const [settings, setSettings] = useState<UserNotificationSettings | null>(null);

  useEffect(() => {
    // Load user settings from storage or API
    const loadSettings = async () => {
      // Example: Load from AsyncStorage or your backend
      const userSettings: UserNotificationSettings = {
        enabled: true,
        groupSchedules: groups.map(group => ({
          groupId: group.id,
          groupName: group.name,
          enabled: true,
          schedule: {
            time: '20:00', // Default time for all groups
          },
        })),
      };
      
      setSettings(userSettings);
      
      // Schedule notifications
      if (userSettings.enabled) {
        await scheduleNotificationsFromSettings(userSettings);
      }
    };

    loadSettings();
  }, []);

  return { settings, setSettings };
}
*/
