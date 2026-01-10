import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WaffleColors } from '@/constants/theme';
import { groups, vlogs, weeklyRecap } from '@/constants/mockData';

export default function GroupFeedScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const group = groups.find((g) => g.id === id) || groups[0];
  const groupVlogs = vlogs.filter((v) => v.groupId === id);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>···</Text>
        </TouchableOpacity>
      </View>

      {/* Group info */}
      <View style={styles.groupInfo}>
        <View style={styles.groupEmojiLarge}>
          <Text style={styles.groupEmojiText}>{group.emoji}</Text>
        </View>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupMeta}>{group.memberCount} members</Text>

        {/* Member row */}
        <View style={styles.membersRow}>
          {group.members.map((member, index) => (
            <View key={member.id} style={[styles.memberAvatar, { marginLeft: index > 0 ? -12 : 0 }]}>
              <Text style={styles.memberEmoji}>{member.emoji}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addMemberButton}>
            <Text style={styles.addMemberText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      >
        {/* Weekly recap card */}
        {id === '1' && (
          <TouchableOpacity style={styles.recapCard} activeOpacity={0.9}>
            <View style={styles.recapHeader}>
              <Text style={styles.recapEmoji}>✨</Text>
              <View style={styles.recapTitleContainer}>
                <Text style={styles.recapTitle}>Weekly Recap</Text>
                <Text style={styles.recapDate}>{weeklyRecap.generatedAt}</Text>
              </View>
              <View style={styles.recapBadge}>
                <Text style={styles.recapBadgeText}>AI</Text>
              </View>
            </View>
            <Text style={styles.recapSummary} numberOfLines={3}>
              {weeklyRecap.summary}
            </Text>
            <View style={styles.recapHighlights}>
              {weeklyRecap.highlights.slice(0, 2).map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Text style={styles.highlightBullet}>•</Text>
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.recapAction}>Listen to full recap →</Text>
            {/* Scribble decoration */}
            <Text style={styles.recapScribble}>{"~magic~"}</Text>
          </TouchableOpacity>
        )}

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Vlogs</Text>
          <Text style={styles.sectionSubtitle}>from your friends</Text>
        </View>

        {/* Vlog feed */}
        {groupVlogs.length > 0 ? (
          groupVlogs.map((vlog) => (
            <TouchableOpacity key={vlog.id} style={styles.vlogCard} activeOpacity={0.9}>
              {/* Video thumbnail */}
              <View style={styles.vlogThumbnail}>
                <View style={styles.vlogPlayButton}>
                  <Text style={styles.vlogPlayIcon}>▶</Text>
                </View>
                <View style={styles.vlogDuration}>
                  <Text style={styles.vlogDurationText}>{vlog.duration}</Text>
                </View>
                {!vlog.hasViewed && <View style={styles.vlogUnwatchedDot} />}
                {/* Scribble border effect */}
                <View style={styles.vlogThumbnailBorder} />
              </View>

              {/* Vlog info */}
              <View style={styles.vlogInfo}>
                <View style={styles.vlogUserRow}>
                  <View style={styles.vlogUserAvatar}>
                    <Text style={styles.vlogUserEmoji}>{vlog.userEmoji}</Text>
                  </View>
                  <View style={styles.vlogUserInfo}>
                    <Text style={styles.vlogUserName}>{vlog.userName}</Text>
                    <Text style={styles.vlogTimestamp}>{vlog.timestamp}</Text>
                  </View>
                </View>
                <Text style={styles.vlogPrompt}>"{vlog.prompt}"</Text>

                {/* Actions */}
                <View style={styles.vlogActions}>
                  <TouchableOpacity style={styles.vlogActionButton}>
                    <Text style={styles.vlogActionText}>💬 Reply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.vlogActionButton}>
                    <Text style={styles.vlogActionText}>❤️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No vlogs yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share!</Text>
          </View>
        )}

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Record FAB */}
      <TouchableOpacity style={styles.recordFab} activeOpacity={0.9}>
        <Text style={styles.recordFabIcon}>🎬</Text>
        <Text style={styles.recordFabText}>Record</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WaffleColors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  menuButton: {
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 20,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  groupInfo: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: WaffleColors.dustGrey,
    marginHorizontal: 24,
  },
  groupEmojiLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: WaffleColors.yellow,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  groupEmojiText: {
    fontSize: 36,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    marginBottom: 4,
  },
  groupMeta: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    marginBottom: 16,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WaffleColors.parchment,
    borderWidth: 2,
    borderColor: WaffleColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberEmoji: {
    fontSize: 18,
  },
  addMemberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WaffleColors.dustGrey,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
  },
  addMemberText: {
    fontSize: 18,
    fontWeight: '600',
    color: WaffleColors.charcoal,
  },
  feedContainer: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  recapCard: {
    backgroundColor: WaffleColors.parchment,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    padding: 20,
    marginBottom: 24,
  },
  recapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recapEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  recapTitleContainer: {
    flex: 1,
  },
  recapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  recapDate: {
    fontSize: 12,
    color: WaffleColors.charcoal,
  },
  recapBadge: {
    backgroundColor: WaffleColors.yellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: WaffleColors.carbonBlack,
  },
  recapBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  recapSummary: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    lineHeight: 20,
    marginBottom: 12,
  },
  recapHighlights: {
    marginBottom: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  highlightBullet: {
    fontSize: 14,
    color: WaffleColors.yellow,
    marginRight: 8,
    fontWeight: '700',
  },
  highlightText: {
    fontSize: 13,
    color: WaffleColors.carbonBlack,
    flex: 1,
  },
  recapAction: {
    fontSize: 14,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
    textDecorationLine: 'underline',
  },
  recapScribble: {
    position: 'absolute',
    top: 16,
    right: 70,
    fontSize: 11,
    color: WaffleColors.charcoal,
    opacity: 0.4,
    fontStyle: 'italic',
    transform: [{ rotate: '-5deg' }],
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: WaffleColors.charcoal,
  },
  vlogCard: {
    backgroundColor: WaffleColors.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    marginBottom: 16,
    overflow: 'hidden',
  },
  vlogThumbnail: {
    height: 180,
    backgroundColor: WaffleColors.dustGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vlogThumbnailBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomWidth: 2,
    borderBottomColor: WaffleColors.carbonBlack,
  },
  vlogPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: WaffleColors.yellow,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  vlogPlayIcon: {
    fontSize: 24,
    color: WaffleColors.carbonBlack,
    marginLeft: 4,
  },
  vlogDuration: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: WaffleColors.carbonBlack,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vlogDurationText: {
    fontSize: 12,
    fontWeight: '600',
    color: WaffleColors.white,
  },
  vlogUnwatchedDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: WaffleColors.yellow,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
  },
  vlogInfo: {
    padding: 16,
  },
  vlogUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vlogUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WaffleColors.parchment,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vlogUserEmoji: {
    fontSize: 20,
  },
  vlogUserInfo: {
    flex: 1,
  },
  vlogUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  vlogTimestamp: {
    fontSize: 12,
    color: WaffleColors.charcoal,
  },
  vlogPrompt: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  vlogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  vlogActionButton: {
    backgroundColor: WaffleColors.parchment,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: WaffleColors.carbonBlack,
  },
  vlogActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: WaffleColors.charcoal,
  },
  recordFab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WaffleColors.yellow,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: WaffleColors.carbonBlack,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    gap: 8,
  },
  recordFabIcon: {
    fontSize: 20,
  },
  recordFabText: {
    fontSize: 16,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
});
