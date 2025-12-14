import apiClient from "@/lib/api-client";
import type {
  LoginRequest,
  LoginResponse,
  MenusPermissionsResponse,
} from "../types";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getMenusPermissions(): Promise<MenusPermissionsResponse> {
    const response = await apiClient.get<MenusPermissionsResponse>(
      "/auth/me/menus-permissions",
    );
    return response.data;
  },
};
