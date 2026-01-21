import apiClient from "@/lib/api-client";
import type {
  CreatePermissionFormData,
  UpdatePermissionFormData,
  ListPermissionsParams,
  ListPermissionsResponse,
  PermissionResponse,
} from "../types";

export const permissionService = {
  /**
   * Get list of permissions with pagination and filters
   */
  async list(params?: ListPermissionsParams): Promise<ListPermissionsResponse> {
    const response = await apiClient.get<ListPermissionsResponse>(
      "/admin/permissions",
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * Get permission by ID
   */
  async getById(id: string): Promise<PermissionResponse> {
    const response = await apiClient.get<PermissionResponse>(
      `/admin/permissions/${id}`,
    );
    return response.data;
  },

  /**
   * Create new permission
   */
  async create(
    data: CreatePermissionFormData,
  ): Promise<PermissionResponse> {
    const response = await apiClient.post<PermissionResponse>(
      "/admin/permissions",
      data,
    );
    return response.data;
  },

  /**
   * Update permission
   */
  async update(
    id: string,
    data: UpdatePermissionFormData,
  ): Promise<PermissionResponse> {
    const response = await apiClient.put<PermissionResponse>(
      `/admin/permissions/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete permission
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/permissions/${id}`);
  },
};




