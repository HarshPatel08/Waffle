import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
// Only show banner notifications (not alert-style modals)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // No modal alerts - just banners
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Show banner notifications (slide-down)
    shouldShowList: true, // Show in notification center
  }),
});

// Types for notification schedules
export interface NotificationSchedule {
  // Time in 24-hour format (e.g., "14:30" for 2:30 PM)
  time: string;
  // Days of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // If empty, notification is sent daily
  daysOfWeek?: number[];
  // Timezone offset in minutes (optional, defaults to device timezone)
  timezoneOffset?: number;
}

export interface GroupNotificationSettings {
  groupId: string;
  groupName: string;
  enabled: boolean;
  schedule: NotificationSchedule;
}

export interface UserNotificationSettings {
  // Default schedule for general notifications
  defaultSchedule?: NotificationSchedule;
  // Group-specific schedules override the default
  groupSchedules: GroupNotificationSettings[];
  // Global notification toggle
  enabled: boolean;
}

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Parse time string (HH:mm) to hours and minutes
 */
function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

/**
 * Schedule a notification for a specific group
 */
export async function scheduleGroupNotification(
  groupId: string,
  groupName: string,
  schedule: NotificationSchedule,
  message?: string
): Promise<string | null> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = `group_${groupId}_${Date.now()}`;
    const defaultMessage = message || `Time to share in ${groupName}! 🎬`;

    // If specific days are set, schedule separate notifications for each day
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      const notificationIds: string[] = [];
      const { hour, minute } = parseTime(schedule.time);
      const now = new Date();

      console.log(`[Notifications] Scheduling weekly notification for group ${groupId}`);
      console.log(`[Notifications] Days of week: ${schedule.daysOfWeek.join(', ')}`);
      console.log(`[Notifications] Time: ${hour}:${minute.toString().padStart(2, '0')}`);

      for (const dayOfWeek of schedule.daysOfWeek) {
        const dayNotificationId = `${notificationId}_day_${dayOfWeek}`;
        
        // Calculate seconds until next occurrence of this day
        const currentDay = now.getDay();
        let daysUntilDay = (dayOfWeek - currentDay + 7) % 7;
        
        // Calculate the exact next trigger date/time
        const triggerDate = new Date(now);
        triggerDate.setDate(now.getDate() + daysUntilDay);
        triggerDate.setHours(hour, minute, 0, 0);
        triggerDate.setSeconds(0);
        triggerDate.setMilliseconds(0);
        
        // If same day, check if time has passed
        if (daysUntilDay === 0) {
          if (triggerDate <= now) {
            daysUntilDay = 7; // Next week
            triggerDate.setDate(triggerDate.getDate() + 7);
          }
        }
        
        const millisecondsUntilTrigger = triggerDate.getTime() - now.getTime();
        let secondsUntilTrigger = Math.floor(millisecondsUntilTrigger / 1000);
        
        // Apply minimum delay protection (same as daily)
        if (secondsUntilTrigger < 10) {
          secondsUntilTrigger = 10;
          triggerDate.setTime(now.getTime() + (secondsUntilTrigger * 1000));
          console.log(`[Notifications] WARNING: Weekly notification for day ${dayOfWeek} too soon, adjusting to ${secondsUntilTrigger} seconds`);
        }

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        console.log(`[Notifications] Scheduling for ${dayNames[dayOfWeek]} at ${hour}:${minute.toString().padStart(2, '0')}`);
        console.log(`[Notifications] Seconds until trigger: ${secondsUntilTrigger} (${triggerDate.toLocaleString()})`);

        // CRITICAL FIX: Only schedule recurring notification if the first one is more than 24 hours away
        // This prevents immediate firing of recurring notifications scheduled for today
        if (secondsUntilTrigger >= 86400) {
          // First notification is tomorrow or later - safe to schedule recurring
          const recurringId = `${dayNotificationId}_weekly_recurring`;
          await Notifications.scheduleNotificationAsync({
            identifier: recurringId,
            content: {
              title: groupName,
              body: defaultMessage,
              data: { groupId, type: 'group_reminder', dayOfWeek, weekly: true },
              sound: true,
            },
            trigger: {
              weekday: dayOfWeek + 1, // Expo uses 1-7 (Sunday = 1, Monday = 2, etc.)
              hour,
              minute,
              repeats: true,
              channelId: 'default',
            },
          });
          notificationIds.push(recurringId);
          console.log(`[Notifications] Scheduled recurring weekly notification for ${dayNames[dayOfWeek]}`);
        }
        
        // Always schedule the first occurrence
        const firstId = await Notifications.scheduleNotificationAsync({
          identifier: `${dayNotificationId}_first`,
          content: {
            title: groupName,
            body: defaultMessage,
            data: { groupId, type: 'group_reminder', dayOfWeek, weekly: true },
            sound: true,
          },
          trigger: {
            seconds: secondsUntilTrigger,
            repeats: false, // One-time for first occurrence
            channelId: 'default',
          },
        });

        notificationIds.push(firstId);
        console.log(`[Notifications] Scheduled weekly notification for ${dayNames[dayOfWeek]} - First ID: ${firstId}`);
        if (secondsUntilTrigger >= 86400) {
          console.log(`[Notifications] Recurring weekly notification also scheduled for ${dayNames[dayOfWeek]}`);
        }
      }

      console.log(`[Notifications] Scheduled ${notificationIds.length} weekly notifications total`);
      return notificationIds.join(','); // Return comma-separated IDs
    }

    // Daily recurrence
    const { hour, minute } = parseTime(schedule.time);
    const now = new Date();
    
    // Calculate the exact next occurrence of the scheduled time
    const nextTrigger = new Date();
    nextTrigger.setHours(hour, minute, 0, 0);
    nextTrigger.setSeconds(0);
    nextTrigger.setMilliseconds(0);
    
    // If the time has already passed today, schedule for tomorrow
    if (nextTrigger <= now) {
      nextTrigger.setDate(nextTrigger.getDate() + 1);
    }
    
    // Calculate seconds until the trigger time - ensure it's at least 10 seconds in the future
    // This prevents immediate firing due to timing issues and gives Expo time to process
    const millisecondsUntilTrigger = nextTrigger.getTime() - now.getTime();
    let secondsUntilTrigger = Math.floor(millisecondsUntilTrigger / 1000);
    
    // CRITICAL: Ensure notification is always scheduled for the future, never immediate
    // Minimum 10 seconds to avoid any timing edge cases
    if (secondsUntilTrigger < 10) {
      // If less than 10 seconds, schedule for 10 seconds from now instead
      secondsUntilTrigger = 10;
      // Recalculate nextTrigger to reflect this
      nextTrigger.setTime(now.getTime() + (secondsUntilTrigger * 1000));
      console.log(`[Notifications] WARNING: Requested time too soon, adjusting to ${secondsUntilTrigger} seconds from now`);
    }
    
    console.log(`[Notifications] Scheduling daily notification for group ${groupId}`);
    console.log(`[Notifications] Scheduled time: ${hour}:${minute.toString().padStart(2, '0')}`);
    console.log(`[Notifications] Current time: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds()}`);
    console.log(`[Notifications] Next trigger: ${nextTrigger.toLocaleString()}`);
    console.log(`[Notifications] Seconds until trigger: ${secondsUntilTrigger}`);
    
    // CRITICAL FIX: Verify seconds is positive and reasonable before scheduling
    if (secondsUntilTrigger <= 0) {
      console.error(`[Notifications] ERROR: Calculated seconds is ${secondsUntilTrigger}, adjusting to 10 seconds`);
      secondsUntilTrigger = 10;
    }
    
    // For daily notifications, use hour/minute trigger with repeats ONLY if scheduling for tomorrow or later
    // For today/soon, use seconds trigger to prevent immediate firing
    let identifier: string;
    
    if (secondsUntilTrigger >= 86400) {
      // Tomorrow or later - use hour/minute trigger for accurate daily repeats
      console.log(`[Notifications] Using hour/minute trigger for daily recurring (${secondsUntilTrigger}s = ${Math.floor(secondsUntilTrigger/3600)}h away)`);
      identifier = await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: groupName,
          body: defaultMessage,
          data: { groupId, type: 'group_reminder' },
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true, // Daily repeat at the specified hour:minute
          channelId: 'default',
        },
      });
      console.log(`[Notifications] Scheduled daily recurring notification with ID: ${identifier}`);
    } else {
      // Today or soon - use seconds trigger to prevent immediate firing
      // Don't schedule recurring yet to avoid duplicates
      console.log(`[Notifications] Using seconds trigger for near-future notification (${secondsUntilTrigger}s)`);
      identifier = await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: groupName,
          body: defaultMessage,
          data: { groupId, type: 'group_reminder' },
          sound: true,
        },
        trigger: {
          seconds: secondsUntilTrigger,
          repeats: false, // One-time notification - we'll handle recurring differently
          channelId: 'default',
        },
      });
      console.log(`[Notifications] Scheduled one-time notification with ID: ${identifier} for ${secondsUntilTrigger} seconds`);
      console.log(`[Notifications] NOTE: Daily recurring will need to be rescheduled after this notification fires`);
    }
    
    // Verify the notification was actually scheduled
    const verifyScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduled = verifyScheduled.find(n => n.identifier === notificationId || n.identifier === identifier);
    if (scheduled) {
      const trigger = scheduled.trigger as any;
      console.log(`[Notifications] ✅ VERIFIED: Notification scheduled with trigger:`, trigger);
    } else {
      console.error(`[Notifications] ❌ ERROR: Notification was not found in scheduled list!`);
    }
    
    return identifier;
  } catch (error) {
    console.error('Error scheduling group notification:', error);
    return null;
  }
}

/**
 * Schedule notifications based on user settings
 */
export async function scheduleNotificationsFromSettings(
  settings: UserNotificationSettings
): Promise<string[]> {
  if (!settings.enabled) {
    return [];
  }

  const notificationIds: string[] = [];

  // Cancel existing notifications first
  await cancelAllNotifications();

  // Schedule group-specific notifications
  for (const groupSchedule of settings.groupSchedules) {
    if (groupSchedule.enabled) {
      const id = await scheduleGroupNotification(
        groupSchedule.groupId,
        groupSchedule.groupName,
        groupSchedule.schedule
      );
      if (id) {
        // Handle comma-separated IDs from weekly schedules
        if (id.includes(',')) {
          notificationIds.push(...id.split(','));
        } else {
          notificationIds.push(id);
        }
      }
    }
  }

  // If no group schedules but default schedule exists, use default
  if (notificationIds.length === 0 && settings.defaultSchedule) {
    const id = await scheduleGroupNotification(
      'default',
      'Waffle',
      settings.defaultSchedule,
      "Time to share your daily vlog! 🎬"
    );
    if (id) {
      if (id.includes(',')) {
        notificationIds.push(...id.split(','));
      } else {
        notificationIds.push(id);
      }
    }
  }

  return notificationIds;
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancel notifications for a specific group
 */
export async function cancelGroupNotifications(groupId: string): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    const data = notification.content.data as { groupId?: string };
    if (data?.groupId === groupId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Update notification schedule for a group
 */
export async function updateGroupNotificationSchedule(
  groupId: string,
  groupName: string,
  schedule: NotificationSchedule | null
): Promise<boolean> {
  // Cancel existing notifications for this group
  await cancelGroupNotifications(groupId);

  // If schedule is null or disabled, just cancel (already done above)
  if (!schedule) {
    return true;
  }

  // Schedule new notifications
  const id = await scheduleGroupNotification(groupId, groupName, schedule);
  return id !== null;
}

/**
 * Get notification permissions status
 */
export async function getPermissionStatus(): Promise<Notifications.NotificationPermissionsStatus> {
  return await Notifications.getPermissionsAsync();
}

// Example usage helper function
export function createDefaultUserSettings(): UserNotificationSettings {
  return {
    enabled: true,
    defaultSchedule: {
      time: '20:00', // 8:00 PM
    },
    groupSchedules: [],
  };
}

/**
 * TEST HELPER: Schedule a notification in X seconds (for testing)
 */
export async function scheduleTestNotification(seconds: number = 5): Promise<string | null> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return null;
    }

    // Ensure minimum 5 seconds to avoid immediate firing
    const safeSeconds = Math.max(5, seconds);
    if (seconds < 5) {
      console.log(`[Notifications] WARNING: Requested ${seconds} seconds, adjusting to ${safeSeconds} seconds minimum`);
    }

    console.log(`[Notifications] Scheduling test notification in ${safeSeconds} seconds`);

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Notification',
        body: `This is a test notification scheduled ${safeSeconds} seconds from now!`,
        data: { type: 'test' },
        sound: true,
      },
      trigger: {
        seconds: safeSeconds,
        channelId: 'default',
      },
    });

    console.log(`[Notifications] Test notification scheduled with ID: ${identifier}`);
    return identifier;
  } catch (error) {
    console.error('Error scheduling test notification:', error);
    return null;
  }
}

/**
 * TEST HELPER: Send an immediate notification (for testing)
 */
export async function sendImmediateTestNotification(): Promise<void> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Immediate Test',
        body: 'This notification was triggered immediately!',
        data: { type: 'test', immediate: true },
        sound: true,
      },
      trigger: null, // null = immediate
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
}
