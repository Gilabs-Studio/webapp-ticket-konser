import apiClient from "@/lib/api-client";
import type { ApiResponse, Attendee, AttendeeFilters } from "../types";

export const attendanceService = {
  /**
   * Get list of attendees with pagination and filters
   */
  async getAttendees(
    filters?: AttendeeFilters,
  ): Promise<ApiResponse<Attendee[]>> {
    const params = new URLSearchParams();
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.ticket_tier) {
      params.append("ticket_tier", filters.ticket_tier);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    params.append("per_page", (filters?.per_page ?? 10).toString());

    const response = await apiClient.get<ApiResponse<Attendee[]>>(
      `/admin/attendees?${params.toString()}`,
    );

    return response.data;
  },

  /**
   * Export attendees list
   */
  async exportAttendees(filters?: AttendeeFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.ticket_tier) {
      params.append("ticket_tier", filters.ticket_tier);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }

    const response = await apiClient.get(`/admin/attendees/export?${params.toString()}`, {
      responseType: "blob",
    });

    return response.data;
  },
};
