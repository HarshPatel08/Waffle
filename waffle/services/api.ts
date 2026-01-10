const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  user?: T;
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
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
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
}

export const api = new ApiService();
export type { User, SignUpData, SignInData, ApiResponse };
