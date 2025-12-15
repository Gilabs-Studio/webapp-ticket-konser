import apiClient from "@/lib/api-client";

// API Response types
interface TicketCategoryResponse {
  id: string;
  event_id: string;
  category_name: string;
  price: number;
  quota: number;
  limit_per_user: number;
  created_at: string;
  updated_at: string;
  event?: {
    id: string;
    event_name: string;
    description?: string;
    banner_image?: string;
    status: string;
    start_date: string;
    end_date: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: unknown;
  timestamp: string;
  request_id: string;
}

export const ticketCategoryService = {
  /**
   * Get ticket category by ID
   */
  async getTicketCategoryById(
    id: string,
  ): Promise<ApiResponse<TicketCategoryResponse>> {
    const response = await apiClient.get<ApiResponse<TicketCategoryResponse>>(
      `/admin/ticket-categories/${id}`,
    );
    return response.data;
  },

  /**
   * Get all ticket categories
   */
  async getTicketCategories(): Promise<ApiResponse<TicketCategoryResponse[]>> {
    const response = await apiClient.get<ApiResponse<TicketCategoryResponse[]>>(
      "/admin/ticket-categories",
    );
    return response.data;
  },

  /**
   * Create ticket category
   */
  async createTicketCategory(
    data: {
      event_id: string;
      category_name: string;
      price: number;
      quota: number;
      limit_per_user: number;
    },
  ): Promise<ApiResponse<TicketCategoryResponse>> {
    const response = await apiClient.post<
      ApiResponse<TicketCategoryResponse>
    >("/admin/ticket-categories", data);
    return response.data;
  },

  /**
   * Update ticket category
   */
  async updateTicketCategory(
    id: string,
    data: {
      category_name?: string;
      price?: number;
      quota?: number;
      limit_per_user?: number;
    },
  ): Promise<ApiResponse<TicketCategoryResponse>> {
    const response = await apiClient.put<ApiResponse<TicketCategoryResponse>>(
      `/admin/ticket-categories/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete ticket category
   */
  async deleteTicketCategory(id: string): Promise<void> {
    await apiClient.delete(`/admin/ticket-categories/${id}`);
  },
};
