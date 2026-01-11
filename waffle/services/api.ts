const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  user?: T;
  [key: string]: any; // Allow other dynamic fields like 'invitations'
}

interface User {
  id: string;
  name: string;
  email: string;
  emoji: string;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  emoji?: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface GroupMember {
  id: string;
  name: string;
  emoji: string;
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  memberCount: number;
  members: GroupMember[];
  createdAt?: string;
  updatedAt?: string;
}

interface CreateGroupData {
  name: string;
  emoji?: string;
  description?: string;
  createdBy: string;
}

interface Vlog {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  publicUrl: string;
  duration: number;
  prompt: string;
  createdAt: string;
  hasViewed?: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('[API] Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid response');
      }

      console.log('[API] Response:', { status: response.status, success: data.success });

      if (!response.ok) {
        console.error('[API] Request failed:', data.message);
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('[API] Request error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async signUp(data: SignUpData): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: SignInData): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    return response.json();
  }

  async getGroups(userId: string): Promise<{ success: boolean; groups: Group[] }> {
    const response = await fetch(`${this.baseUrl}/api/groups/user/${userId}`);
    return response.json();
  }

  async getGroup(groupId: string): Promise<{ success: boolean; group: Group }> {
    const response = await fetch(`${this.baseUrl}/api/groups/${groupId}`);
    return response.json();
  }

  async createGroup(data: CreateGroupData): Promise<{ success: boolean; message: string; group: Group }> {
    const response = await fetch(`${this.baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getVlogs(groupId: string): Promise<{ success: boolean; vlogs: Vlog[] }> {
    const response = await fetch(`${this.baseUrl}/api/vlogs/group/${groupId}`);
    return response.json();
  }

  async getWatchUrl(vlogId: string): Promise<{ success: boolean; watchUrl: string; expiresIn: number }> {
    const response = await fetch(`${this.baseUrl}/api/vlogs/watch/${vlogId}`);
    return response.json();
  }
}

export const api = new ApiService();
export type { User, SignUpData, SignInData, ApiResponse, Group, GroupMember, CreateGroupData, Vlog };
