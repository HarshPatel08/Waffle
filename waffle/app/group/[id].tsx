import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WaffleColors } from "@/constants/theme";
import { vlogs, weeklyRecap } from "@/constants/mockData";
import { WaffleBackground } from "@/components/waffle-background";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { useAuth } from '@/context/AuthContext';
import { api, Group } from '@/services/api';

const API_BASE = "http://localhost:3001"; // TODO: replace with your Mac IP + backend port

export default function GroupFeedScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch group data when component mounts
  useEffect(() => {
    if (id) {
      fetchGroup();
    }
  }, [id]);

  const fetchGroup = async () => {
    try {
      setIsLoading(true);
      const response = await api.getGroup(String(id));
      if (response.success) {
        setGroup(response.group);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if no user (e.g., after sign out)
  if (!user) {
    router.replace('/');
    return null;
  }

  const groupVlogs = vlogs.filter((v) => v.groupId === id);

  // ✅ IMPORTANT: inside component so it can access `id`
  async function uploadVlog() {
    try {
      if (!id) throw new Error("Group ID missing (route param `id`)");

      console.log("[UPLOAD] start");

      const picked = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (picked.canceled) {
        console.log("[UPLOAD] canceled");
        return;
      }

      const asset = picked.assets?.[0];
      if (!asset?.uri) throw new Error("No video selected");

      const groupId = String(id);

      // Detect MIME type (MOV support)
      const uriLower = asset.uri.toLowerCase();
      let contentType = asset.mimeType;
      if (!contentType) {
        if (uriLower.endsWith(".mov")) contentType = "video/quicktime";
        else if (uriLower.endsWith(".mp4")) contentType = "video/mp4";
        else contentType = "video/mp4";
      }

      console.log("[UPLOAD] picked", { uri: asset.uri, mime: asset.mimeType, contentType, groupId });

      // 1) signed URL
      console.log("[UPLOAD] requesting signed url...");
      console.log(API_BASE);
      const signedRes = await fetch(`${API_BASE}/api/vlogs/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, groupId, contentType }),
      });

      const signedText = await signedRes.text();
      console.log("[UPLOAD] upload-url status", signedRes.status, signedText);

      let signedJson: any;
      try {
        signedJson = JSON.parse(signedText);
      } catch {
        throw new Error(`upload-url returned non-JSON (status ${signedRes.status})`);
      }

      if (!signedRes.ok || !signedJson.success) {
        throw new Error(signedJson.message || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl, gcsPath } = signedJson;
      console.log("[UPLOAD] got signed url", { gcsPath, publicUrl });

      // 2) PUT to GCS
      console.log("[UPLOAD] uploading to GCS...");

      if (Platform.OS === "web") {
        // Web: asset.uri is blob:http://... so fetch it as a Blob then PUT it
        const blobRes = await fetch(asset.uri);
        const blob = await blobRes.blob();

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
          },
          body: blob,
        });

        console.log("[UPLOAD] PUT(web) status", putRes.status);

        if (!putRes.ok) {
          const errText = await putRes.text().catch(() => "");
          throw new Error(`GCS upload failed (web) status ${putRes.status} ${errText}`);
        }
      } else {
        // Native: use expo-file-system
        const putResult = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
          httpMethod: "PUT",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: { "Content-Type": contentType },
        });

        console.log("[UPLOAD] PUT(native) result", {
          status: putResult.status,
          body: putResult.body?.slice?.(0, 200),
        });

        if (putResult.status < 200 || putResult.status >= 300) {
          throw new Error(`GCS upload failed (native) status ${putResult.status}`);
        }
      }


      // 3) Create DB record
      console.log("[UPLOAD] creating vlog record...");
      const createRes = await fetch(`${API_BASE}/api/vlogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          groupId,
          gcsPath,
          publicUrl,
          duration: 0,
          prompt: "",
        }),
      });

      const createText = await createRes.text();
      console.log("[UPLOAD] create status", createRes.status, createText);

      let createJson: any;
      try {
        createJson = JSON.parse(createText);
      } catch {
        throw new Error(`create vlog returned non-JSON (status ${createRes.status})`);
      }

      if (!createRes.ok || !createJson.success) {
        throw new Error(createJson.message || "Failed to save vlog");
      }

      console.log("[UPLOAD] DONE ✅", createJson);
      Alert.alert("Uploaded!", "Vlog uploaded and saved.");
    } catch (e: any) {
      console.log("[UPLOAD] ERROR ❌", e);
      Alert.alert("Upload failed", e?.message ?? "Unknown error");
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <>
        <WaffleBackground />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={WaffleColors.yellow} />
          </View>
        </View>
      </>
    );
  }

  // Show error state if group not found
  if (!group) {
    return (
      <>
        <WaffleBackground />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorTitle}>Group not found</Text>
            <Text style={styles.errorSubtitle}>This group may have been deleted</Text>
          </View>
        </View>
      </>
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
          <Text style={styles.groupMeta}>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</Text>

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
          {id === "1" && (
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
              <Text style={styles.recapScribble}>{"~magic~"}</Text>
            </TouchableOpacity>
          )}

          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Vlogs</Text>
            <Text style={styles.sectionSubtitle}>from your friends</Text>
          </View>

          {/* Vlog feed (still mock data) */}
          {groupVlogs.length > 0 ? (
            groupVlogs.map((vlog) => (
              <TouchableOpacity key={vlog.id} style={styles.vlogCard} activeOpacity={0.9}>
                <View style={styles.vlogThumbnail}>
                  <View style={styles.vlogPlayButton}>
                    <Text style={styles.vlogPlayIcon}>▶</Text>
                  </View>
                  <View style={styles.vlogDuration}>
                    <Text style={styles.vlogDurationText}>{vlog.duration}</Text>
                  </View>
                  {!vlog.hasViewed && <View style={styles.vlogUnwatchedDot} />}
                  <View style={styles.vlogThumbnailBorder} />
                </View>

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

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Upload FAB */}
        <TouchableOpacity style={styles.recordFab} activeOpacity={0.9} onPress={uploadVlog}>
          <Text style={styles.recordFabIcon}>📤</Text>
          <Text style={styles.recordFabText}>Upload</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    textAlign: 'center',
  },
});
