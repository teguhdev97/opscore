const API_BASE_URL = 'http://localhost:3000/api/v1';
const FRONTEND_BASE_URL = 'http://localhost:5173';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
  token: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private getToken() {
    return this.token || localStorage.getItem('auth_token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.error?.message || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me', { method: 'GET' });
  }

  googleLoginUrl() {
    return `${API_BASE_URL}/auth/google`;
  }

  async completeGoogleLogin(): Promise<AuthResponse> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    if (error) throw new Error('Login Google dibatalkan.');
    if (!code) throw new Error('Kode OAuth Google tidak ditemukan.');
    const data = await this.request('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getHealth() {
    return this.request('/health', { method: 'GET' });
  }

  async requestPasswordReset(email: string) {
    return this.request('/auth/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) });
  }

  async resendPasswordReset(email: string) {
    return this.request('/auth/password-reset/resend', { method: 'POST', body: JSON.stringify({ email }) });
  }

  async confirmPasswordReset(token: string, password: string) {
    return this.request('/auth/password-reset/confirm', { method: 'POST', body: JSON.stringify({ token, password }) });
  }
}

export const apiClient = new ApiClient();
