import apiClient from "@/lib/api-client";

// API Response types
interface EventResponse {
  id: string;
  event_name: string;
  description?: string;
  banner_image?: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  timestamp: string;
  request_id: string;
}

export const eventService = {
  /**
   * Get list of events
   */
  async getEvents(filters?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<EventResponse[]>> {
    const params = new URLSearchParams();
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }

    const response = await apiClient.get<ApiResponse<EventResponse[]>>(
      `/admin/events?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<ApiResponse<EventResponse>> {
    const response = await apiClient.get<ApiResponse<EventResponse>>(
      `/admin/events/${id}`,
    );
    return response.data;
  },
};
