import apiClient from "@/lib/api-client";
import type {
  Menu,
  CreateMenuRequest,
  UpdateMenuRequest,
  ApiResponse,
} from "../types";

export const menuService = {
  async getMenusByRole(): Promise<ApiResponse<Menu[]>> {
    const response = await apiClient.get<ApiResponse<Menu[]>>("/menus");
    return response.data;
  },

  async list(): Promise<ApiResponse<Menu[]>> {
    const response = await apiClient.get<ApiResponse<Menu[]>>("/admin/menus");
    return response.data;
  },

  async create(data: CreateMenuRequest): Promise<ApiResponse<Menu>> {
    const response = await apiClient.post<ApiResponse<Menu>>("/admin/menus", data);
    return response.data;
  },

  async update(id: string, data: UpdateMenuRequest): Promise<ApiResponse<Menu>> {
    const response = await apiClient.put<ApiResponse<Menu>>(`/admin/menus/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/menus/${id}`);
  },
};
