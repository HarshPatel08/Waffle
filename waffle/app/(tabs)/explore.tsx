import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { currentUser, groups } from '@/constants/mockData';

export default function ProfileScreen() {
  const router = useRouter();

  const totalVlogs = 47;
  const totalGroups = groups.length;
  const streak = 12;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsEmoji}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarEmoji}>{currentUser.emoji}</Text>
        </View>
        <Text style={styles.userName}>{currentUser.name}</Text>
        <Text style={styles.userHandle}>@{currentUser.name.toLowerCase().replace(' ', '')}</Text>

        {/* Edit profile button */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Scribble decoration */}
        <Text style={styles.profileScribble}>{"~you~"}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalVlogs}</Text>
          <Text style={styles.statLabel}>Vlogs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalGroups}</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.streakContainer}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.streakFire}>🔥</Text>
          </View>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Settings section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>

      <View style={styles.settingsList}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Text style={styles.settingEmoji}>🔔</Text>
          </View>
          <Text style={styles.settingText}>Notifications</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Text style={styles.settingEmoji}>🎙️</Text>
          </View>
          <Text style={styles.settingText}>Recording Settings</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Text style={styles.settingEmoji}>🔒</Text>
          </View>
          <Text style={styles.settingText}>Privacy</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Text style={styles.settingEmoji}>❓</Text>
          </View>
          <Text style={styles.settingText}>Help & Support</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>Waffle v1.0.0</Text>

      {/* Spacer */}
      <View style={{ height: 100 }} />
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: WaffleColors.parchment,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsEmoji: {
    fontSize: 20,
  },
  profileCard: {
    backgroundColor: WaffleColors.parchment,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: WaffleColors.yellow,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: WaffleColors.white,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  profileScribble: {
    position: 'absolute',
    top: 20,
    right: 24,
    fontSize: 12,
    color: WaffleColors.charcoal,
    opacity: 0.4,
    fontStyle: 'italic',
    transform: [{ rotate: '10deg' }],
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: WaffleColors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    paddingVertical: 20,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  statLabel: {
    fontSize: 13,
    color: WaffleColors.charcoal,
    marginTop: 4,
  },
  statDivider: {
    width: 2,
    backgroundColor: WaffleColors.dustGrey,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakFire: {
    fontSize: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  settingsList: {
    backgroundColor: WaffleColors.parchment,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: WaffleColors.dustGrey,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: WaffleColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingEmoji: {
    fontSize: 20,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: WaffleColors.carbonBlack,
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 18,
    color: WaffleColors.charcoal,
  },
  signOutButton: {
    backgroundColor: WaffleColors.white,
    paddingVertical: 16,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    marginBottom: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: WaffleColors.charcoal,
    opacity: 0.6,
  },
});
