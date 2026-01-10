import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import {
  requestPermissions,
  getPermissionStatus,
  scheduleTestNotification,
  sendImmediateTestNotification,
  scheduleGroupNotification,
  getAllScheduledNotifications,
  cancelAllNotifications,
  scheduleNotificationsFromSettings,
  type NotificationSchedule,
} from '@/notifications';
import { groups } from '@/constants/mockData';

export default function NotificationsTestScreen() {
  const router = useRouter();
  const [permissionStatus, setPermissionStatus] = useState<string>('Checking...');
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = async () => {
    const status = await getPermissionStatus();
    setPermissionStatus(status.status);
    
    const scheduled = await getAllScheduledNotifications();
    setScheduledCount(scheduled.length);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    const granted = await requestPermissions();
    await loadStatus();
    setIsLoading(false);
    
    Alert.alert(
      granted ? '✅ Permissions Granted' : '❌ Permissions Denied',
      granted 
        ? 'You can now receive notifications!' 
        : 'Please enable notifications in your device settings.',
      [{ text: 'OK' }]
    );
  };

  const handleImmediateTest = async () => {
    setIsLoading(true);
    await sendImmediateTestNotification();
    setIsLoading(false);
    Alert.alert('✅ Test Sent', 'Check your notification tray!');
  };

  const handleTestIn5Seconds = async () => {
    setIsLoading(true);
    const id = await scheduleTestNotification(5);
    await loadStatus();
    setIsLoading(false);
    
    if (id) {
      Alert.alert('✅ Scheduled', 'You should receive a notification in 5 seconds!');
    } else {
      Alert.alert('❌ Failed', 'Could not schedule notification. Check permissions.');
    }
  };

  const handleTestDaily = async () => {
    setIsLoading(true);
    const schedule: NotificationSchedule = {
      time: new Date(Date.now() + 60000).toTimeString().slice(0, 5), // 1 minute from now
    };
    const id = await scheduleGroupNotification(
      'test-group',
      'Daily Test',
      schedule,
      'This is a daily test notification! 🎬'
    );
    await loadStatus();
    setIsLoading(false);
    
    if (id) {
      Alert.alert('✅ Scheduled', 'Daily notification scheduled for 1 minute from now!');
    }
  };

  const handleTestWeekly = async () => {
    setIsLoading(true);
    const now = new Date();
    const currentDay = now.getDay();
    
    const schedule: NotificationSchedule = {
      time: new Date(Date.now() + 60000).toTimeString().slice(0, 5), // 1 minute from now
      daysOfWeek: [currentDay], // Today
    };
    
    const id = await scheduleGroupNotification(
      'test-group-weekly',
      'Weekly Test',
      schedule,
      'This is a weekly test notification! 📅'
    );
    await loadStatus();
    setIsLoading(false);
    
    if (id) {
      Alert.alert('✅ Scheduled', 'Weekly notification scheduled for today in 1 minute!');
    }
  };

  const handleScheduleAllGroups = async () => {
    setIsLoading(true);
    
    const settings = {
      enabled: true,
      groupSchedules: groups.map((group) => ({
        groupId: group.id,
        groupName: group.name,
        enabled: true,
        schedule: {
          time: '20:00', // 8:00 PM
        },
      })),
    };
    
    const ids = await scheduleNotificationsFromSettings(settings);
    await loadStatus();
    setIsLoading(false);
    
    Alert.alert(
      '✅ Scheduled',
      `Scheduled ${ids.length} notification(s) for all groups at 8:00 PM daily!`
    );
  };

  const handleViewScheduled = async () => {
    const scheduled = await getAllScheduledNotifications();
    await loadStatus();
    
    if (scheduled.length === 0) {
      Alert.alert('No Scheduled Notifications', 'You have no scheduled notifications.');
      return;
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const details = scheduled
      .map((n, i) => {
        const data = n.content.data as { groupId?: string; type?: string; dayOfWeek?: number; weekly?: boolean };
        const trigger = n.trigger as any;
        
        let triggerInfo = 'Unknown';
        if (trigger.seconds !== undefined) {
          const minutes = Math.floor(trigger.seconds / 60);
          const hours = Math.floor(minutes / 60);
          if (hours > 0) {
            triggerInfo = `In ${hours}h ${minutes % 60}m`;
          } else {
            triggerInfo = `In ${minutes}m`;
          }
          if (trigger.repeats) {
            triggerInfo += ' (repeats)';
          }
        } else if (trigger.weekday !== undefined) {
          const dayName = dayNames[trigger.weekday - 1] || `Day ${trigger.weekday}`;
          triggerInfo = `Weekly on ${dayName} at ${trigger.hour || 0}:${String(trigger.minute || 0).padStart(2, '0')}`;
          if (trigger.repeats) triggerInfo += ' (repeats)';
        } else if (trigger.hour !== undefined && trigger.minute !== undefined) {
          triggerInfo = `Daily at ${trigger.hour}:${String(trigger.minute).padStart(2, '0')}`;
          if (trigger.repeats) triggerInfo += ' (repeats)';
        } else if (trigger === null) {
          triggerInfo = 'Immediate';
        }
        
        let typeInfo = data?.type || 'N/A';
        if (data?.weekly) {
          const dayName = data.dayOfWeek !== undefined ? dayNames[data.dayOfWeek] : 'Unknown';
          typeInfo = `Weekly (${dayName})`;
        }
        
        return `${i + 1}. ${n.content.title}\n   Body: ${n.content.body}\n   Group: ${data?.groupId || 'N/A'}\n   Type: ${typeInfo}\n   Trigger: ${triggerInfo}\n   ID: ${n.identifier}`;
      })
      .join('\n\n');
    
    Alert.alert(
      `Scheduled Notifications (${scheduled.length})`,
      details,
      [{ text: 'OK' }]
    );
  };

  const handleCancelAll = async () => {
    Alert.alert(
      'Cancel All Notifications?',
      'This will cancel all scheduled notifications.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel All',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            await cancelAllNotifications();
            await loadStatus();
            setIsLoading(false);
            Alert.alert('✅ Cancelled', 'All notifications have been cancelled.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Test Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Permissions:</Text>
            <Text style={[styles.statusValue, permissionStatus === 'granted' && styles.statusGranted]}>
              {permissionStatus}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Scheduled:</Text>
            <Text style={styles.statusValue}>{scheduledCount} notification(s)</Text>
          </View>
        </View>

        {/* Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tests</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleRequestPermissions}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>1️⃣ Request Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.testButton]} 
            onPress={handleImmediateTest}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>⚡ Send Immediate Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.testButton]} 
            onPress={handleTestIn5Seconds}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>⏱️ Test in 5 Seconds</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Tests</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.scheduleButton]} 
            onPress={handleTestDaily}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>📅 Schedule Daily (1 min from now)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.scheduleButton]} 
            onPress={handleTestWeekly}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>🗓️ Schedule Weekly (today, 1 min)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.scheduleButton]} 
            onPress={handleScheduleAllGroups}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>👥 Schedule All Groups (8:00 PM daily)</Text>
          </TouchableOpacity>
        </View>

        {/* Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.infoButton]} 
            onPress={handleViewScheduled}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>📋 View Scheduled Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={handleCancelAll}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>🗑️ Cancel All Notifications</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📝 Testing Instructions</Text>
          <Text style={styles.instructionsText}>
            1. First, request permissions{'\n'}
            2. Try the immediate notification to verify it works{'\n'}
            3. Test scheduling with the 5-second test{'\n'}
            4. Schedule daily/weekly notifications{'\n'}
            5. View scheduled notifications to verify{'\n'}
            6. On iOS: Make sure app has notification permissions in Settings{'\n'}
            7. On Android: Permissions are granted automatically
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WaffleColors.white,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.yellow,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  statusCard: {
    backgroundColor: WaffleColors.parchment,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    padding: 20,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: WaffleColors.charcoal,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  statusGranted: {
    color: '#4CAF50',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    marginBottom: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: WaffleColors.yellow,
  },
  testButton: {
    backgroundColor: WaffleColors.parchment,
  },
  scheduleButton: {
    backgroundColor: WaffleColors.white,
  },
  infoButton: {
    backgroundColor: WaffleColors.parchment,
    borderColor: WaffleColors.charcoal,
  },
  dangerButton: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  loading: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
  },
  instructionsCard: {
    backgroundColor: WaffleColors.parchment,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    padding: 20,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    lineHeight: 20,
  },
});
