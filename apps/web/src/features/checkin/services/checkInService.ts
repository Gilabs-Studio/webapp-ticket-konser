import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  CheckIn,
  CheckInFilters,
  CheckInRequest,
  CheckInResultResponse,
  ValidateQRCodeRequest,
  ValidateQRCodeResponse,
} from "../types";

export const checkInService = {
  /**
   * Validate QR code before check-in
   */
  async validateQRCode(
    request: ValidateQRCodeRequest,
  ): Promise<ApiResponse<ValidateQRCodeResponse>> {
    const response = await apiClient.post<
      ApiResponse<ValidateQRCodeResponse>
    >("/check-in/validate", request);
    return response.data;
  },

  /**
   * Perform check-in operation
   */
  async checkIn(
    request: CheckInRequest,
  ): Promise<ApiResponse<CheckInResultResponse>> {
    const response = await apiClient.post<ApiResponse<CheckInResultResponse>>(
      "/check-in",
      request,
    );
    return response.data;
  },

  /**
   * Get check-in by ID
   */
  async getCheckInById(id: string): Promise<ApiResponse<CheckIn>> {
    const response = await apiClient.get<ApiResponse<CheckIn>>(
      `/check-ins/${id}`,
    );
    return response.data;
  },

  /**
   * Get list of check-ins with pagination and filters
   */
  async getCheckIns(
    filters?: CheckInFilters,
  ): Promise<ApiResponse<CheckIn[]>> {
    const params = new URLSearchParams();
    if (filters?.order_item_id) {
      params.append("order_item_id", filters.order_item_id);
    }
    if (filters?.gate_id) {
      params.append("gate_id", filters.gate_id);
    }
    if (filters?.staff_id) {
      params.append("staff_id", filters.staff_id);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    params.append("per_page", (filters?.per_page ?? 20).toString());

    const response = await apiClient.get<ApiResponse<CheckIn[]>>(
      `/check-ins?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get check-ins by QR code
   */
  async getCheckInsByQRCode(qrCode: string): Promise<ApiResponse<CheckIn[]>> {
    const response = await apiClient.get<ApiResponse<CheckIn[]>>(
      `/check-ins/qr/${encodeURIComponent(qrCode)}`,
    );
    return response.data;
  },

  /**
   * Get check-ins by order item ID
   */
  async getCheckInsByOrderItemId(
    orderItemId: string,
  ): Promise<ApiResponse<CheckIn[]>> {
    const response = await apiClient.get<ApiResponse<CheckIn[]>>(
      `/check-ins/order-item/${orderItemId}`,
    );
    return response.data;
  },

  /**
   * Get check-ins by gate ID
   */
  async getCheckInsByGateId(gateId: string): Promise<ApiResponse<CheckIn[]>> {
    const response = await apiClient.get<ApiResponse<CheckIn[]>>(
      `/check-ins/gate/${gateId}`,
    );
    return response.data;
  },
};

