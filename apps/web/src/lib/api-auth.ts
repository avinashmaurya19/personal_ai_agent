/**
 * Authentication & User Profile API client module.
 */

import { UserProfileItem, AuthTokenResponse } from "./api-types";

const TOKEN_KEY = "personal_ai_token";

export class ApiAuth {
  private request: <T>(endpoint: string, options?: RequestInit) => Promise<T>;

  constructor(requestFn: <T>(endpoint: string, options?: RequestInit) => Promise<T>) {
    this.request = requestFn;
  }

  getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  setAuthToken(token: string | null): void {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  async register(
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthTokenResponse> {
    const data = await this.request<AuthTokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    this.setAuthToken(data.access_token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthTokenResponse> {
    const data = await this.request<AuthTokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setAuthToken(data.access_token);
    return data;
  }

  async loginWithGoogle(accessToken: string): Promise<AuthTokenResponse> {
    const data = await this.request<AuthTokenResponse>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    });
    this.setAuthToken(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<UserProfileItem> {
    return this.request<UserProfileItem>("/api/v1/auth/me");
  }

  logout(): void {
    this.setAuthToken(null);
  }
}
