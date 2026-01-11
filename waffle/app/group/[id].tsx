import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { WaffleColors } from '@/constants/theme';
import { vlogs, weeklyRecap } from '@/constants/mockData';
import { WaffleBackground } from '@/components/waffle-background';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function GroupFeedScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user: currentUser } = useAuth();

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);

  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Filter vlogs for this group (still mock for now)
  const groupVlogs = vlogs.filter((v) => v.groupId === id);

  const fetchGroup = async () => {
    try {
      const res = await api.getGroup(id as string);
      if (res.success && res.group) {
        setGroup(res.group);
      }
    } catch (error) {
      console.error('Failed to fetch group', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPotentialMembers = async () => {
    try {
      const res = await api.getUsers();
      if (res.success && res.users) {
        // Filter out existing members
        const groupMemberIds = group?.members?.map((m: any) => m._id) || [];
        const potential = res.users.filter((u: any) => !groupMemberIds.includes(u._id));
        setAllUsers(potential);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const openAddMemberModal = () => {
    setSelectedUserIds([]);
    fetchPotentialMembers();
    setAddMemberModalVisible(true);
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      const res = await api.createInvitation(
        currentUser!.id,
        group.name,
        selectedUserIds,
        group._id
      );

      if (res.success) {
        Alert.alert('Success', 'Invitations sent!');
        setAddMemberModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to send invitations');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroup();
    }, [id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroup();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={WaffleColors.carbonBlack} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Group not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <WaffleBackground />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <Text style={styles.menuText}>···</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown Menu Modal */}
        <Modal
          transparent={true}
          visible={menuVisible}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    setMembersModalVisible(true);
                  }}
                >
                  <Text style={styles.menuItemText}>👥 Members</Text>
                </TouchableOpacity>
                <View style={styles.menuSeparator} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setMenuVisible(false)}
                >
                  <Text style={styles.menuItemText}>⚙️ Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Members List Modal */}
        <Modal
          transparent={true}
          visible={membersModalVisible}
          animationType="slide"
          onRequestClose={() => setMembersModalVisible(false)}
        >
          <View style={styles.modalCenterOverlay}>
            <View style={styles.membersModalContainer}>
              <View style={styles.membersModalHeader}>
                <Text style={styles.membersModalTitle}>Members ({group.members?.length || 0})</Text>
                <TouchableOpacity onPress={() => setMembersModalVisible(false)}>
                  <Text style={styles.membersModalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.membersList} contentContainerStyle={{ paddingBottom: 20 }}>
                {group.members?.map((member: any) => (
                  <View key={member._id} style={styles.membersListItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberEmoji}>{member.emoji || '👤'}</Text>
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>


        {/* Add Member Modal */}
        <Modal
          transparent={true}
          visible={addMemberModalVisible}
          animationType="slide"
          onRequestClose={() => setAddMemberModalVisible(false)}
        >
          <View style={styles.modalCenterOverlay}>
            <View style={styles.membersModalContainer}>
              <View style={styles.membersModalHeader}>
                <Text style={styles.membersModalTitle}>Add Members</Text>
                <TouchableOpacity onPress={() => setAddMemberModalVisible(false)}>
                  <Text style={styles.membersModalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Select friends to invite to {group.name}</Text>

              <ScrollView style={styles.membersList} contentContainerStyle={{ paddingBottom: 20 }}>
                {allUsers.length > 0 ? (
                  allUsers.map((user: any) => {
                    const isSelected = selectedUserIds.includes(user._id);
                    return (
                      <TouchableOpacity
                        key={user._id}
                        style={[styles.userSelectRow, isSelected && styles.userSelectRowActive]}
                        onPress={() => toggleUserSelection(user._id)}
                      >
                        <View style={styles.userSelectInfo}>
                          <View style={styles.memberAvatar}>
                            <Text style={styles.memberEmoji}>{user.emoji || '👤'}</Text>
                          </View>
                          <Text style={styles.memberName}>{user.name}</Text>
                        </View>
                        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                          {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyStateSmall}>
                    <Text style={styles.emptyStateText}>No new users found to invite.</Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  selectedUserIds.length === 0 && styles.proceedButtonDisabled
                ]}
                onPress={handleAddMembers}
                disabled={selectedUserIds.length === 0}
              >
                <Text style={styles.proceedButtonText}>
                  Invite {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Group info */}
        <View style={styles.groupInfo}>
          <View style={styles.groupEmojiLarge}>
            <Text style={styles.groupEmojiText}>{group.emoji || '🏠'}</Text>
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupMeta}>{group.members?.length || 0} members</Text>

          {/* Member row */}
          <View style={styles.membersRow}>
            {group.members?.slice(0, 5).map((member: any, index: number) => (
              <View key={member._id} style={[styles.memberAvatar, { marginLeft: index > 0 ? -12 : 0 }]}>
                <Text style={styles.memberEmoji}>{member.emoji || '👤'}</Text>
              </View>
            ))}
            {group.members?.length > 5 && (
              <View style={[styles.memberAvatar, styles.memberAvatarMore, { marginLeft: -12 }]}>
                <Text style={styles.memberMoreText}>+{group.members.length - 5}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.addMemberButton} onPress={openAddMemberModal}>
              <Text style={styles.addMemberText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.feedContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  memberAvatarMore: {
    backgroundColor: WaffleColors.charcoal,
    zIndex: 10,
  },
  memberMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: WaffleColors.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 24,
  },
  modalCenterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuContainer: {
    backgroundColor: WaffleColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    width: 200,
    paddingVertical: 8,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: WaffleColors.dustGrey,
    marginVertical: 4,
  },
  membersModalContainer: {
    backgroundColor: WaffleColors.parchment,
    width: '100%',
    maxHeight: '70%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    padding: 20,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  membersModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: WaffleColors.charcoal,
  },
  membersModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  membersModalClose: {
    fontSize: 24,
    color: WaffleColors.charcoal,
    fontWeight: '700',
  },
  membersList: {
    width: '100%',
  },
  membersListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  memberEmail: {
    fontSize: 12,
    color: WaffleColors.charcoal,
    marginTop: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    marginBottom: 16,
  },
  userSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  userSelectRowActive: {
    backgroundColor: 'rgba(255, 199, 0, 0.1)', // Light yellow
    borderColor: WaffleColors.yellow,
  },
  userSelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: WaffleColors.dustGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: WaffleColors.yellow,
    borderColor: WaffleColors.carbonBlack,
  },
  checkboxCheck: {
    fontSize: 14,
    color: WaffleColors.carbonBlack,
    fontWeight: '700',
  },
  emptyStateSmall: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: WaffleColors.charcoal,
    fontStyle: 'italic',
  },
  proceedButton: {
    backgroundColor: WaffleColors.yellow,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    shadowColor: WaffleColors.carbonBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  proceedButtonDisabled: {
    backgroundColor: WaffleColors.dustGrey,
    borderColor: WaffleColors.charcoal,
    shadowOpacity: 0,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
});
