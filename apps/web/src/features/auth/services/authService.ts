import apiClient from "@/lib/api-client";
import type {
  LoginRequest,
  RefreshTokenRequest,
  LoginResponseData,
  ApiResponse,
} from "../types";

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<LoginResponseData>> {
    const request: RefreshTokenRequest = {
      refresh_token: refreshToken,
    };
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      "/auth/refresh",
      request
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};
