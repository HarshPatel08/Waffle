import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { currentUser, groups } from '@/constants/mockData';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with profile */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hey, {currentUser.name.split(' ')[0]}!</Text>
          <Text style={styles.subGreeting}>Ready to share today?</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{currentUser.emoji}</Text>
        </TouchableOpacity>
      </View>

      {/* Record prompt card */}
      <TouchableOpacity style={styles.recordCard} activeOpacity={0.9}>
        <View style={styles.recordContent}>
          <Text style={styles.recordEmoji}>🎬</Text>
          <View style={styles.recordTextContainer}>
            <Text style={styles.recordTitle}>Today's prompt</Text>
            <Text style={styles.recordPrompt}>"What made you smile today?"</Text>
          </View>
        </View>
        <View style={styles.recordButton}>
          <Text style={styles.recordButtonText}>Record</Text>
        </View>
        {/* Scribble decoration */}
        <Text style={styles.recordScribble}>{"~tap~"}</Text>
      </TouchableOpacity>

      {/* Groups section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Groups</Text>
        <TouchableOpacity>
          <Text style={styles.sectionAction}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.groupsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.groupsListContent}
      >
        {groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={styles.groupCard}
            activeOpacity={0.8}
            onPress={() => router.push(`/group/${group.id}`)}
          >
            <View style={styles.groupEmoji}>
              <Text style={styles.groupEmojiText}>{group.emoji}</Text>
            </View>
            <View style={styles.groupInfo}>
              <View style={styles.groupNameRow}>
                <Text style={styles.groupName}>{group.name}</Text>
                {group.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{group.unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.groupMeta}>
                {group.memberCount} members · {group.lastActivity}
              </Text>
              <View style={styles.memberAvatars}>
                {group.members.slice(0, 3).map((member, index) => (
                  <View
                    key={member.id}
                    style={[styles.memberAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
                  >
                    <Text style={styles.memberAvatarEmoji}>{member.emoji}</Text>
                  </View>
                ))}
                {group.memberCount > 3 && (
                  <View style={[styles.memberAvatar, styles.memberAvatarMore, { marginLeft: -8 }]}>
                    <Text style={styles.memberMoreText}>+{group.memberCount - 3}</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.groupArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating scribble decoration */}
      <View style={styles.floatingScribble}>
        <Text style={styles.floatingScribbleText}>{"* * *"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WaffleColors.white,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 16,
    color: WaffleColors.charcoal,
    marginTop: 4,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: WaffleColors.parchment,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  recordCard: {
    marginHorizontal: 24,
    backgroundColor: WaffleColors.yellow,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    padding: 20,
    marginBottom: 32,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recordEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  recordTextContainer: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 14,
    color: WaffleColors.carbonBlack,
    opacity: 0.7,
    marginBottom: 4,
  },
  recordPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
    fontStyle: 'italic',
  },
  recordButton: {
    backgroundColor: WaffleColors.white,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    paddingVertical: 12,
    alignItems: 'center',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  recordScribble: {
    position: 'absolute',
    top: 12,
    right: 16,
    fontSize: 12,
    color: WaffleColors.carbonBlack,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  sectionAction: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.yellow,
  },
  groupsList: {
    flex: 1,
  },
  groupsListContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WaffleColors.parchment,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    padding: 16,
    marginBottom: 12,
  },
  groupEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: WaffleColors.white,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupEmojiText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  unreadBadge: {
    backgroundColor: WaffleColors.yellow,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: WaffleColors.carbonBlack,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  groupMeta: {
    fontSize: 13,
    color: WaffleColors.charcoal,
    marginTop: 2,
    marginBottom: 8,
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: WaffleColors.dustGrey,
    borderWidth: 1.5,
    borderColor: WaffleColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarEmoji: {
    fontSize: 12,
  },
  memberAvatarMore: {
    backgroundColor: WaffleColors.charcoal,
  },
  memberMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: WaffleColors.white,
  },
  groupArrow: {
    fontSize: 20,
    color: WaffleColors.charcoal,
    marginLeft: 8,
  },
  floatingScribble: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
  },
  floatingScribbleText: {
    fontSize: 16,
    color: WaffleColors.charcoal,
    opacity: 0.2,
  },
});
