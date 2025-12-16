import apiClient from "@/lib/api-client";
import type {
  CreateRoleFormData,
  UpdateRoleFormData,
  ListRolesParams,
  ListRolesResponse,
  RoleResponse,
  RoleWithPermissionsResponse,
  AssignPermissionsFormData,
} from "../types";

export const roleService = {
  /**
   * Get list of roles with pagination and filters
   */
  async list(params?: ListRolesParams): Promise<ListRolesResponse> {
    const response = await apiClient.get<ListRolesResponse>("/admin/roles", {
      params,
    });
    return response.data;
  },

  /**
   * Get role by ID
   */
  async getById(id: string): Promise<RoleResponse> {
    const response = await apiClient.get<RoleResponse>(`/admin/roles/${id}`);
    return response.data;
  },

  /**
   * Get role by ID with permissions
   */
  async getByIdWithPermissions(
    id: string,
  ): Promise<RoleWithPermissionsResponse> {
    const response = await apiClient.get<RoleWithPermissionsResponse>(
      `/admin/roles/${id}?include=permissions`,
    );
    return response.data;
  },

  /**
   * Create new role
   */
  async create(data: CreateRoleFormData): Promise<RoleResponse> {
    const response = await apiClient.post<RoleResponse>("/admin/roles", data);
    return response.data;
  },

  /**
   * Update role
   */
  async update(id: string, data: UpdateRoleFormData): Promise<RoleResponse> {
    const response = await apiClient.put<RoleResponse>(
      `/admin/roles/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete role
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/roles/${id}`);
  },

  /**
   * Assign permissions to role
   */
  async assignPermissions(
    id: string,
    data: AssignPermissionsFormData,
  ): Promise<RoleWithPermissionsResponse> {
    const response = await apiClient.put<RoleWithPermissionsResponse>(
      `/admin/roles/${id}/permissions`,
      data,
    );
    return response.data;
  },
};

