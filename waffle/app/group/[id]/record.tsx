import React, { useCallback, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";

const API_BASE = "https://your-api.com"; // TODO: set this

async function getUploadUrl(userId: string, groupId: string) {
  const res = await fetch(`${API_BASE}/api/vlogs/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, groupId, contentType: "video/mp4" }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to get upload URL");
  return json as { uploadUrl: string; publicUrl: string; gcsPath: string };
}

async function uploadToGCS(uploadUrl: string, fileUri: string) {
  const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": "video/mp4" },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed (${result.status})`);
  }
}

async function createVlog(userId: string, groupId: string, gcsPath: string, publicUrl: string) {
  const res = await fetch(`${API_BASE}/api/vlogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      groupId,
      gcsPath,
      publicUrl,
      duration: 0,
      prompt: "",
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to save vlog");
  return json;
}

export default function RecordVlogScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // groupId from URL
  const groupId = String(id);

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // TODO: replace with your auth user id
  const userId = "USER_ID";

  const start = useCallback(async () => {
    try {
      if (!cameraRef.current) return;

      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: 60, quality: "1080p" });
      setIsRecording(false);

      if (!video?.uri) throw new Error("No video file returned");

      setIsUploading(true);

      // 1) signed URL
      const { uploadUrl, publicUrl, gcsPath } = await getUploadUrl(userId, groupId);

      // 2) upload bytes to GCS
      await uploadToGCS(uploadUrl, video.uri);

      // 3) create DB record
      await createVlog(userId, groupId, gcsPath, publicUrl);

      setIsUploading(false);
      router.back(); // go back to feed
    } catch (e: any) {
      setIsRecording(false);
      setIsUploading(false);
      Alert.alert("Upload failed", e?.message ?? "Unknown error");
    }
  }, [groupId, userId]);

  const stop = useCallback(() => {
    cameraRef.current?.stopRecording();
  }, []);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={(r) => (cameraRef.current = r)} style={{ flex: 1 }} mode="video" />

      <View style={{ padding: 16, gap: 12 }}>
        <TouchableOpacity
          disabled={isUploading}
          onPress={isRecording ? stop : start}
          style={{
            padding: 16,
            borderWidth: 2,
            borderRadius: 14,
            alignItems: "center",
            opacity: isUploading ? 0.6 : 1,
          }}
        >
          <Text style={{ fontWeight: "700" }}>{isRecording ? "Stop" : "Record"}</Text>
        </TouchableOpacity>

        {isUploading && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ActivityIndicator />
            <Text>Uploading…</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()} style={{ alignItems: "center", padding: 8 }}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
