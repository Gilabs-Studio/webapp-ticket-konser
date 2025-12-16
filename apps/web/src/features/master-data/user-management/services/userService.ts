import apiClient from "@/lib/api-client";
import type {
  CreateUserFormData,
  UpdateUserFormData,
  ListUsersParams,
  ListUsersResponse,
  UserResponse,
} from "../types";

export const userService = {
  /**
   * Get list of users with pagination and filters
   */
  async list(params?: ListUsersParams): Promise<ListUsersResponse> {
    const response = await apiClient.get<ListUsersResponse>("/users", {
      params,
    });
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  async create(data: CreateUserFormData): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>("/users", data);
    return response.data;
  },

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserFormData): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Get user permissions (if needed separately from menus-permissions)
   */
  async getPermissions(userId: string): Promise<{
    success: boolean;
    data: {
      menus: unknown[];
      permissions: unknown[];
    };
  }> {
    const response = await apiClient.get(`/users/${userId}/permissions`);
    return response.data;
  },
};

