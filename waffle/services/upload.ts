import * as FileSystem from 'expo-file-system';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface UploadUrlResponse {
  success: boolean;
  uploadUrl: string;
  publicUrl: string;
  gcsPath: string;
  expiresIn: number;
  message?: string;
}

interface UploadProgress {
  totalBytesSent: number;
  totalBytesExpectedToSend: number;
  percentage: number;
}

interface VlogData {
  userId: string;
  groupId: string;
  gcsPath: string;
  publicUrl: string;
  duration: number;
  prompt: string;
}

interface VlogResponse {
  success: boolean;
  message?: string;
  vlog?: {
    id: string;
    publicUrl: string;
    duration: number;
    prompt: string;
    createdAt: string;
  };
}

interface GroupsResponse {
  success: boolean;
  groups: Array<{
    id: string;
    name: string;
    emoji: string;
    memberCount: number;
    members: Array<{ id: string; name: string; emoji: string }>;
  }>;
}

interface VlogsResponse {
  success: boolean;
  vlogs: Array<{
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

class UploadService {
  // Get signed URL for upload
  async getUploadUrl(
    userId: string,
    groupId: string
  ): Promise<UploadUrlResponse> {
    console.log('[UPLOAD] Getting upload URL...', { userId, groupId });

    const response = await fetch(`${API_URL}/api/vlogs/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, groupId }),
    });

    const data = await response.json();
    console.log('[UPLOAD] Upload URL response:', data.success);

    if (!data.success) {
      throw new Error(data.message || 'Failed to get upload URL');
    }

    return data;
  }

  // Upload video with progress tracking
  async uploadVideo(
    localUri: string,
    signedUrl: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    console.log('[UPLOAD] Starting upload to GCS...');

    const uploadTask = FileSystem.createUploadTask(
      signedUrl,
      localUri,
      {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'Content-Type': 'video/mp4',
        },
      },
      (data) => {
        if (onProgress) {
          const percentage = Math.round(
            (data.totalBytesSent / data.totalBytesExpectedToSend) * 100
          );
          onProgress({
            totalBytesSent: data.totalBytesSent,
            totalBytesExpectedToSend: data.totalBytesExpectedToSend,
            percentage,
          });
          console.log(`[UPLOAD] Progress: ${percentage}%`);
        }
      }
    );

    const result = await uploadTask.uploadAsync();

    if (!result || result.status !== 200) {
      console.error('[UPLOAD] Upload failed:', result);
      throw new Error('Upload failed');
    }

    console.log('[UPLOAD] Upload complete');
  }

  // Save vlog metadata to database
  async saveVlog(data: VlogData): Promise<VlogResponse> {
    console.log('[UPLOAD] Saving vlog metadata...');

    const response = await fetch(`${API_URL}/api/vlogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('[UPLOAD] Save vlog response:', result.success);

    return result;
  }

  // Full upload flow
  async uploadVlog(
    localUri: string,
    userId: string,
    groupId: string,
    duration: number,
    prompt: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<VlogResponse> {
    console.log('[UPLOAD] Starting full upload flow...');

    // 1. Get signed URL
    const { uploadUrl, publicUrl, gcsPath } = await this.getUploadUrl(
      userId,
      groupId
    );

    // 2. Upload to GCS
    await this.uploadVideo(localUri, uploadUrl, onProgress);

    // 3. Save metadata
    const result = await this.saveVlog({
      userId,
      groupId,
      gcsPath,
      publicUrl,
      duration,
      prompt,
    });

    console.log('[UPLOAD] Full upload flow complete');
    return result;
  }

  // Get user's groups
  async getUserGroups(userId: string): Promise<GroupsResponse> {
    console.log('[UPLOAD] Fetching user groups...');

    const response = await fetch(`${API_URL}/api/groups/user/${userId}`);
    return response.json();
  }

  // Get vlogs for a group
  async getGroupVlogs(
    groupId: string,
    limit = 20,
    offset = 0
  ): Promise<VlogsResponse> {
    console.log('[UPLOAD] Fetching group vlogs...');

    const response = await fetch(
      `${API_URL}/api/vlogs/group/${groupId}?limit=${limit}&offset=${offset}`
    );
    return response.json();
  }

  // Create a new group
  async createGroup(
    name: string,
    emoji: string,
    createdBy: string
  ): Promise<{ success: boolean; group?: any; message?: string }> {
    console.log('[UPLOAD] Creating group...');

    const response = await fetch(`${API_URL}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, emoji, createdBy }),
    });

    return response.json();
  }
}

export const uploadService = new UploadService();
export type { UploadProgress, VlogResponse, GroupsResponse, VlogsResponse };
