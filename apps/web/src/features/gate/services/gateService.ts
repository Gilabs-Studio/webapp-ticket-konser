import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  AssignStaffToGateRequest,
  AssignTicketToGateRequest,
  CreateGateRequest,
  Gate,
  GateCheckInRequest,
  GateFilters,
  GateStatistics,
  UpdateGateRequest,
  User,
} from "../types";
import type { CheckInResultResponse } from "@/features/checkin/types";

export const gateService = {
  /**
   * Get gates assigned to current staff member
   */
  async getMyGates(): Promise<ApiResponse<Gate[]>> {
    const response = await apiClient.get<ApiResponse<Gate[]>>("/gates/my");
    return response.data;
  },

  /**
   * Get list of gates with pagination and filters
   */
  async getGates(filters?: GateFilters): Promise<ApiResponse<Gate[]>> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.is_vip !== undefined) {
      params.append("is_vip", filters.is_vip.toString());
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    params.append("per_page", (filters?.per_page ?? 20).toString());

    const response = await apiClient.get<ApiResponse<Gate[]>>(
      `/gates?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get gate by ID
   */
  async getGateById(id: string): Promise<ApiResponse<Gate>> {
    const response = await apiClient.get<ApiResponse<Gate>>(`/gates/${id}`);
    return response.data;
  },

  /**
   * Create a new gate
   */
  async createGate(
    request: CreateGateRequest,
  ): Promise<ApiResponse<Gate>> {
    const response = await apiClient.post<ApiResponse<Gate>>(
      "/gates",
      request,
    );
    return response.data;
  },

  /**
   * Update a gate
   */
  async updateGate(
    id: string,
    request: UpdateGateRequest,
  ): Promise<ApiResponse<Gate>> {
    const response = await apiClient.put<ApiResponse<Gate>>(
      `/gates/${id}`,
      request,
    );
    return response.data;
  },

  /**
   * Delete a gate
   */
  async deleteGate(id: string): Promise<void> {
    await apiClient.delete(`/gates/${id}`);
  },

  /**
   * Assign ticket to gate
   */
  async assignTicketToGate(
    gateId: string,
    request: AssignTicketToGateRequest,
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/gates/${gateId}/assign-ticket`,
      request,
    );
    return response.data;
  },

  /**
   * Perform check-in at a specific gate
   */
  async gateCheckIn(
    gateId: string,
    request: GateCheckInRequest,
  ): Promise<ApiResponse<CheckInResultResponse>> {
    const response = await apiClient.post<ApiResponse<CheckInResultResponse>>(
      `/gates/${gateId}/check-in`,
      request,
    );
    return response.data;
  },

  /**
   * Get gate statistics
   */
  async getGateStatistics(
    gateId: string,
  ): Promise<ApiResponse<GateStatistics>> {
    const response = await apiClient.get<ApiResponse<GateStatistics>>(
      `/gates/${gateId}/statistics`,
    );
    return response.data;
  },

  /**
   * Get staff members assigned to a gate
   */
  async getAssignedStaff(gateId: string): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `/gates/${gateId}/staff`,
    );
    return response.data;
  },

  /**
   * Assign staff to gate
   */
  async assignStaffToGate(
    gateId: string,
    request: AssignStaffToGateRequest,
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/gates/${gateId}/assign-staff`,
      request,
    );
    return response.data;
  },

  /**
   * Unassign staff from gate
   */
  async unassignStaffFromGate(
    gateId: string,
    staffId: string,
  ): Promise<void> {
    await apiClient.delete(`/gates/${gateId}/assign-staff/${staffId}`);
  },
};
