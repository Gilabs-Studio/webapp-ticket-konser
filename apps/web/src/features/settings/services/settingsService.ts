import apiClient from "@/lib/api-client";
import type { EventSettingsFormData } from "../schemas/event-settings.schema";

// API Response types
interface EventSettingsResponse {
  event_name: string;
  event_date: string;
  location: string;
  description: string;
  banner_image: string;
  contact_email: string;
  contact_phone: string;
  is_sales_paused: boolean;
}

interface EventDateResponse {
  event_date: string;
}

interface SystemSettingsResponse {
  site_name: string;
  site_description: string;
  maintenance_mode: boolean;
  max_upload_size: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: unknown;
  timestamp: string;
  request_id: string;
}

export const settingsService = {
  /**
   * Get event date for countdown (public endpoint)
   */
  async getEventDate(): Promise<string> {
    const response = await apiClient.get<ApiResponse<EventDateResponse>>(
      "/settings/event-date",
    );
    return response.data.data.event_date ?? "2025-12-31T00:00:00+07:00";
  },

  /**
   * Get event settings
   */
  async getEventSettings(): Promise<ApiResponse<EventSettingsFormData>> {
    const response = await apiClient.get<ApiResponse<EventSettingsResponse>>(
      "/settings/event",
    );

    const settings: EventSettingsFormData = {
      eventName: response.data.data.event_name ?? "",
      eventDate: response.data.data.event_date ?? "",
      location: response.data.data.location ?? "",
      description: response.data.data.description ?? "",
      bannerImage: response.data.data.banner_image ?? "",
      contactEmail: response.data.data.contact_email ?? "",
      contactPhone: response.data.data.contact_phone ?? "",
      isSalesPaused: response.data.data.is_sales_paused ?? false,
    };

    return {
      success: response.data.success,
      data: settings,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Update event settings
   */
  async updateEventSettings(
    data: Partial<EventSettingsFormData> & { eventDate?: string },
  ): Promise<ApiResponse<EventSettingsFormData>> {
    const response = await apiClient.put<ApiResponse<EventSettingsResponse>>(
      "/settings/event",
      {
        event_name: data.eventName,
        event_date: data.eventDate,
        location: data.location,
        description: data.description,
        banner_image: data.bannerImage,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        is_sales_paused: data.isSalesPaused,
      },
    );

    const settings: EventSettingsFormData = {
      eventName: response.data.data.event_name ?? "",
      eventDate: response.data.data.event_date ?? "",
      location: response.data.data.location ?? "",
      description: response.data.data.description ?? "",
      bannerImage: response.data.data.banner_image ?? "",
      contactEmail: response.data.data.contact_email ?? "",
      contactPhone: response.data.data.contact_phone ?? "",
      isSalesPaused: response.data.data.is_sales_paused ?? false,
    };

    return {
      success: response.data.success,
      data: settings,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<ApiResponse<SystemSettingsResponse>> {
    const response = await apiClient.get<ApiResponse<SystemSettingsResponse>>(
      "/settings/system",
    );
    return response.data;
  },

  /**
   * Update system settings
   */
  async updateSystemSettings(
    data: Partial<SystemSettingsResponse>,
  ): Promise<ApiResponse<SystemSettingsResponse>> {
    const response = await apiClient.put<ApiResponse<SystemSettingsResponse>>(
      "/settings/system",
      data,
    );
    return response.data;
  },
};
