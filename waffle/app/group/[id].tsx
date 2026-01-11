import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WaffleColors } from "@/constants/theme";
import { WaffleBackground } from "@/components/waffle-background";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { useAuth } from '@/context/AuthContext';
import { api, Group, Vlog } from '@/services/api';
import { useVideoPlayer, VideoView } from 'expo-video';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_BASE = "http://localhost:3001"; // TODO: replace with your Mac IP + backend port

export default function GroupFeedScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [vlogs, setVlogs] = useState<Vlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVlog, setSelectedVlog] = useState<Vlog | null>(null);
  const [watchUrl, setWatchUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // AI Prompt generation state
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

  // Video player for the selected vlog
  const player = useVideoPlayer(watchUrl, (player) => {
    if (watchUrl) {
      player.play();
    }
  });

  // Fetch signed watch URL when a vlog is selected
  const handlePlayVlog = async (vlog: Vlog) => {
    setSelectedVlog(vlog);
    setIsLoadingVideo(true);
    setWatchUrl(null);

    try {
      const response = await api.getWatchUrl(vlog.id);
      if (response.success) {
        setWatchUrl(response.watchUrl);
      } else {
        Alert.alert('Error', 'Could not load video');
        setSelectedVlog(null);
      }
    } catch (error) {
      console.error('Error fetching watch URL:', error);
      Alert.alert('Error', 'Could not load video');
      setSelectedVlog(null);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Clear watch URL when modal closes
  const handleCloseModal = () => {
    if (player) {
      player.pause();
    }
    setSelectedVlog(null);
    setWatchUrl(null);
  };

  // Fetch group and vlogs when component mounts
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [groupRes, vlogsRes] = await Promise.all([
        api.getGroup(String(id)),
        api.getVlogs(String(id)),
      ]);
      if (groupRes.success) {
        setGroup(groupRes.group);
      }
      if (vlogsRes.success) {
        setVlogs(vlogsRes.vlogs);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate prompt when group screen loads and vlogs are available
  useEffect(() => {
    if (id && vlogs && !isLoading) {
      generatePrompt();
    }
  }, [vlogs, isLoading]);

  // Redirect if no user (e.g., after sign out)
  if (!user) {
    router.replace('/');
    return null;
  }

  // Format duration from seconds to "M:SS" format
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date to relative time
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Calculate posting frequency based on vlog activity
  const calculatePostingFrequency = (): 'daily' | 'weekly' | 'monthly' | 'occasional' => {
    if (vlogs.length === 0) return 'occasional';

    // Analyze recent vlog timestamps to determine frequency
    const recentVlogs = vlogs.slice(0, 10);

    // Count vlogs by recency
    const todayCount = recentVlogs.filter(vlog => {
      const createdAt = new Date(vlog.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      return diffHours < 24;
    }).length;

    const thisWeekCount = recentVlogs.filter(vlog => {
      const createdAt = new Date(vlog.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      return diffDays < 7;
    }).length;

    // Determine frequency based on activity patterns
    if (todayCount >= 2 || (recentVlogs.length >= 5 && todayCount >= 1)) {
      return 'daily';
    }
    if (thisWeekCount >= 2 || recentVlogs.length >= 3) {
      return 'weekly';
    }
    if (recentVlogs.length >= 1) {
      return 'monthly';
    }
    return 'occasional';
  };

  // Generate AI-powered prompt using Gemini
  const generatePrompt = async () => {
    setIsLoadingPrompt(true);
    try {
      // Get API key from environment
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
      }

      // Get previous prompts from existing vlogs to avoid repetition
      const previousPrompts = vlogs
        .slice(0, 5)
        .map(vlog => vlog.prompt)
        .filter((prompt, index, self) => prompt && self.indexOf(prompt) === index);

      const postingFrequency = calculatePostingFrequency();

      // Build frequency-specific instructions
      let frequencyInstructions = '';
      switch (postingFrequency) {
        case 'daily':
          frequencyInstructions = 'Since this group posts DAILY, make the prompt about TODAY\'s specific moment, small wins, or quick updates. Keep it light and current.';
          break;
        case 'weekly':
          frequencyInstructions = 'Since this group posts WEEKLY, make the prompt about the WEEK - highlights, something new, or a moment worth sharing from the past few days.';
          break;
        case 'monthly':
          frequencyInstructions = 'Since this group posts MONTHLY, make the prompt about bigger updates - life changes, accomplishments, or meaningful moments from the past month.';
          break;
        case 'occasional':
        default:
          frequencyInstructions = 'Since this group posts OCCASIONALLY, make the prompt open-ended and flexible - about what\'s new, what matters, or something worth catching up on.';
      }

      // Build the prompt for Gemini
      const systemPrompt = `Generate a complete sentence question for a casual vlog prompt. These are casual 1-2 minute video updates.

Posting frequency: ${postingFrequency}
${frequencyInstructions}

${previousPrompts && previousPrompts.length > 0
          ? `Previous prompts: ${previousPrompts.join(', ')}\nMake sure your new prompt is different.`
          : ''
        }

Generate ONE complete sentence question (8-12 words) that:
- Is a full question sentence (must have a question mark)
- Is casual and friendly
- Is easy to answer in a short video
- Is different from previous prompts

Examples of good prompts (complete sentences):
- "What made you laugh this week?"
- "Who did you hang out with recently?"
- "What's something you're excited about?"

Return ONLY the complete question sentence, no quotes, no explanations.`;

      // Call Gemini using SDK
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          maxOutputTokens: 750,
          temperature: 0.7,
        }
      });

      console.log('[PROMPTS] Calling Gemini API...');

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      let promptText = response.text().trim();

      // Clean up the prompt (remove quotes if Gemini added them)
      promptText = promptText.replace(/^["']|["']$/g, '').trim();

      // Validate word count and completeness
      const wordCount = promptText.split(/\s+/).filter((word: string) => word.length > 0).length;
      const hasQuestionMark = promptText.includes('?');
      const isCompleteSentence = wordCount >= 6 && hasQuestionMark && promptText.length > 15;

      console.log(`[PROMPTS] Generated prompt (${wordCount} words, has ?: ${hasQuestionMark}): "${promptText}"`);

      // Handle prompts that are too short, incomplete, or too long
      let cleanPrompt = promptText;
      if (!isCompleteSentence) {
        console.log('[PROMPTS] Prompt is not a complete sentence, using fallback');
        cleanPrompt = "What made you laugh this week?";
      } else if (wordCount > 15) {
        const words = promptText.split(/\s+/).filter((word: string) => word.length > 0);
        cleanPrompt = words.slice(0, 15).join(' ');
        if (!cleanPrompt.includes('?')) {
          cleanPrompt += '?';
        }
        console.log(`[PROMPTS] Prompt too long, truncated to 15 words: "${cleanPrompt}"`);
      }

      console.log('[PROMPTS] Final prompt:', cleanPrompt);
      setCurrentPrompt(cleanPrompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      // Fallback prompt if API fails
      setCurrentPrompt("What's been the highlight of your week?");
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  // ✅ IMPORTANT: inside component so it can access `id`
  async function uploadVlog() {
    try {
      if (!id) throw new Error("Group ID missing (route param `id`)");
      if (!user) throw new Error("You must be logged in to upload");

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
      // Refresh vlogs to show the new upload
      fetchData();
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
          {/* AI Generated Prompt Card */}
          <View style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Text style={styles.promptEmoji}>✨</Text>
              <Text style={styles.promptLabel}>Today's Prompt</Text>
              {isLoadingPrompt && (
                <ActivityIndicator size="small" color={WaffleColors.charcoal} style={{ marginLeft: 8 }} />
              )}
            </View>
            {currentPrompt ? (
              <Text style={styles.promptText}>"{currentPrompt}"</Text>
            ) : (
              <Text style={styles.promptTextPlaceholder}>Generating prompt...</Text>
            )}
          </View>

          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Vlogs</Text>
            <Text style={styles.sectionSubtitle}>from your friends</Text>
          </View>

          {/* Vlog feed */}
          {vlogs.length > 0 ? (
            vlogs.map((vlog) => (
              <View key={vlog.id} style={styles.vlogCard}>
                <TouchableOpacity
                  style={styles.vlogThumbnail}
                  activeOpacity={0.9}
                  onPress={() => handlePlayVlog(vlog)}
                >
                  <View style={styles.vlogPlayButton}>
                    <Text style={styles.vlogPlayIcon}>▶</Text>
                  </View>
                  <View style={styles.vlogDuration}>
                    <Text style={styles.vlogDurationText}>{formatDuration(vlog.duration)}</Text>
                  </View>
                  {!vlog.hasViewed && <View style={styles.vlogUnwatchedDot} />}
                  <View style={styles.vlogThumbnailBorder} />
                </TouchableOpacity>

                <View style={styles.vlogInfo}>
                  <View style={styles.vlogUserRow}>
                    <View style={styles.vlogUserAvatar}>
                      <Text style={styles.vlogUserEmoji}>{vlog.userEmoji}</Text>
                    </View>
                    <View style={styles.vlogUserInfo}>
                      <Text style={styles.vlogUserName}>{vlog.userName}</Text>
                      <Text style={styles.vlogTimestamp}>{formatTimestamp(vlog.createdAt)}</Text>
                    </View>
                  </View>
                  {vlog.prompt ? <Text style={styles.vlogPrompt}>"{vlog.prompt}"</Text> : null}

                  <View style={styles.vlogActions}>
                    <TouchableOpacity style={styles.vlogActionButton}>
                      <Text style={styles.vlogActionText}>💬 Reply</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.vlogActionButton}>
                      <Text style={styles.vlogActionText}>❤️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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

      {/* Video Player Modal */}
      <Modal
        visible={!!selectedVlog}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {/* Video player */}
            {isLoadingVideo ? (
              <View style={styles.videoLoading}>
                <ActivityIndicator size="large" color={WaffleColors.yellow} />
                <Text style={styles.videoLoadingText}>Loading video...</Text>
              </View>
            ) : watchUrl ? (
              <VideoView
                player={player}
                style={styles.videoPlayer}
                contentFit="contain"
                allowsFullscreen
                allowsPictureInPicture
              />
            ) : null}

            {/* Video info */}
            {selectedVlog && (
              <View style={styles.modalInfo}>
                <View style={styles.modalUserRow}>
                  <View style={styles.modalUserAvatar}>
                    <Text style={styles.modalUserEmoji}>{selectedVlog.userEmoji}</Text>
                  </View>
                  <View>
                    <Text style={styles.modalUserName}>{selectedVlog.userName}</Text>
                    <Text style={styles.modalTimestamp}>{formatTimestamp(selectedVlog.createdAt)}</Text>
                  </View>
                </View>
                {selectedVlog.prompt ? (
                  <Text style={styles.modalPrompt}>"{selectedVlog.prompt}"</Text>
                ) : null}
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    top: -50,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WaffleColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: WaffleColors.carbonBlack,
    borderRadius: 16,
  },
  videoLoading: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: WaffleColors.carbonBlack,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: WaffleColors.white,
  },
  modalInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: WaffleColors.parchment,
    borderRadius: 16,
  },
  modalUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WaffleColors.yellow,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalUserEmoji: {
    fontSize: 20,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
  },
  modalTimestamp: {
    fontSize: 12,
    color: WaffleColors.charcoal,
  },
  modalPrompt: {
    fontSize: 14,
    color: WaffleColors.charcoal,
    fontStyle: 'italic',
  },
  promptCard: {
    backgroundColor: WaffleColors.yellow,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WaffleColors.carbonBlack,
    padding: 20,
    marginBottom: 24,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: WaffleColors.carbonBlack,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '600',
    color: WaffleColors.carbonBlack,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  promptTextPlaceholder: {
    fontSize: 16,
    color: WaffleColors.charcoal,
    fontStyle: 'italic',
  },
});
