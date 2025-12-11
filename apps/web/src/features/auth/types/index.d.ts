import type { ApiResponse } from "@/types/api";

// Auth domain types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LoginResponseData {
  user: User;
  token: string;
  refresh_token: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  status?: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

// Auth store state
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// Re-export for convenience
export type { ApiResponse } from "@/types/api";
