import * as FileSystem from "expo-file-system";

export const API_BASE = "http://localhost:3001"; // TODO: set to your dev IP or ngrok URL

type UploadUrlResponse = {
  success: boolean;
  uploadUrl: string;
  publicUrl: string;
  gcsPath: string;
  expiresIn: number;
  message?: string;
};

type CreateVlogResponse = {
  success: boolean;
  message?: string;
  vlog?: any;
};

export async function getVlogsForGroup(groupId: string) {
  const res = await fetch(`${API_BASE}/api/vlogs/group/${groupId}?limit=50&offset=0`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch vlogs");
  return json.vlogs as Array<{
    id: string;
    userId: string;
    userName: string;
    userEmoji: string;
    publicUrl: string;
    duration: number;
    prompt: string;
    createdAt: string;
    hasViewed: boolean;
  }>;
}

export async function getUploadUrl(params: { userId: string; groupId: string; contentType: string }) {
  const res = await fetch(`${API_BASE}/api/vlogs/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json = (await res.json()) as UploadUrlResponse;
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to get upload URL");
  return json;
}

export async function uploadToSignedUrl(params: {
  uploadUrl: string;
  fileUri: string;
  contentType: string;
}) {
  const result = await FileSystem.uploadAsync(params.uploadUrl, params.fileUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": params.contentType },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed (status ${result.status})`);
  }
}

export async function createVlog(params: {
  userId: string;
  groupId: string;
  gcsPath: string;
  publicUrl: string;
  duration?: number;
  prompt?: string;
}) {
  const res = await fetch(`${API_BASE}/api/vlogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...params,
      duration: params.duration ?? 0,
      prompt: params.prompt ?? "",
    }),
  });

  const json = (await res.json()) as CreateVlogResponse;
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to save vlog");
  return json;
}