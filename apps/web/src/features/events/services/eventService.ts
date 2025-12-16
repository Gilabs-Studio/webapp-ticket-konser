import apiClient from "@/lib/api-client";
import type { Event, EventStatus, ApiResponse } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Helper function to convert relative image URL to full URL
 */
function getFullImageUrl(imageUrl?: string | null): string | undefined {
  if (!imageUrl) return undefined;

  // If already a full URL (http/https), return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If relative path, prepend API base URL
  if (imageUrl.startsWith("/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return imageUrl;
}

// API Response types
interface EventResponse {
  id: string;
  event_name: string;
  description?: string;
  banner_image?: string;
  status: EventStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponseInternal<T> {
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
      next_page?: number;
      prev_page?: number;
    };
    filters?: Record<string, unknown>;
  };
  timestamp: string;
  request_id: string;
}

function mapEventResponse(response: EventResponse): Event {
  return {
    id: response.id,
    eventName: response.event_name,
    description: response.description,
    bannerImage: getFullImageUrl(response.banner_image),
    status: response.status,
    startDate: response.start_date,
    endDate: response.end_date,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
}

/**
 * Helper function to convert date string (YYYY-MM-DD) to ISO 8601 format
 * Go time.Time expects ISO 8601 format (RFC3339)
 * Format: YYYY-MM-DDTHH:mm:ssZ or YYYY-MM-DDTHH:mm:ss+00:00
 */
function formatDateForAPI(dateString: string): string {
  if (!dateString) return dateString;
  // If already in ISO format, return as is
  if (dateString.includes("T")) return dateString;
  // Convert YYYY-MM-DD to ISO 8601 format (YYYY-MM-DDTHH:mm:ss+00:00)
  // For date-only fields, we use midnight UTC with timezone offset
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    // Format as ISO 8601 with timezone
    return date.toISOString();
  } catch {
    // Fallback: append T00:00:00Z for UTC midnight
    return `${dateString}T00:00:00Z`;
  }
}

export const eventService = {
  /**
   * Get list of events (admin)
   */
  async getEvents(filters?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: EventStatus;
  }): Promise<ApiResponse<Event[]>> {
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

    const response = await apiClient.get<
      ApiResponseInternal<EventResponse[]>
    >(`/admin/events?${params.toString()}`);

    const events: Event[] = (response.data.data ?? []).map(mapEventResponse);

    return {
      success: response.data.success,
      data: events,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get event by ID (admin)
   */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    const response = await apiClient.get<ApiResponseInternal<EventResponse>>(
      `/admin/events/${id}`,
    );

    return {
      success: response.data.success,
      data: mapEventResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Create event
   */
  async createEvent(data: {
    eventName: string;
    description?: string;
    bannerImage?: string;
    status?: EventStatus;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<Event>> {
    // Prepare payload - only include fields that are not empty
    const payload: Record<string, unknown> = {
      event_name: data.eventName,
      start_date: formatDateForAPI(data.startDate),
      end_date: formatDateForAPI(data.endDate),
    };

    // Only include description if it's not empty
    if (data.description !== undefined && data.description !== "") {
      payload.description = data.description;
    }

    // Only include banner_image if it's not empty
    if (data.bannerImage !== undefined && data.bannerImage !== "") {
      payload.banner_image = data.bannerImage;
    }

    // Include status if provided, otherwise default to "draft"
    payload.status = data.status || "draft";

    const response = await apiClient.post<ApiResponseInternal<EventResponse>>(
      "/admin/events",
      payload,
    );

    return {
      success: response.data.success,
      data: mapEventResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Update event
   */
  async updateEvent(
    id: string,
    data: {
      eventName?: string;
      description?: string;
      bannerImage?: string;
      status?: EventStatus;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<ApiResponse<Event>> {
    const payload: Record<string, unknown> = {};
    if (data.eventName !== undefined) payload.event_name = data.eventName;
    if (data.description !== undefined && data.description !== "") {
      payload.description = data.description;
    }
    if (data.bannerImage !== undefined && data.bannerImage !== "") {
      payload.banner_image = data.bannerImage;
    }
    if (data.status !== undefined) payload.status = data.status;
    if (data.startDate !== undefined) {
      payload.start_date = formatDateForAPI(data.startDate);
    }
    if (data.endDate !== undefined) {
      payload.end_date = formatDateForAPI(data.endDate);
    }

    const response = await apiClient.put<ApiResponseInternal<EventResponse>>(
      `/admin/events/${id}`,
      payload,
    );

    return {
      success: response.data.success,
      data: mapEventResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/admin/events/${id}`);
  },

  /**
   * Update event status
   */
  async updateEventStatus(
    id: string,
    status: EventStatus,
  ): Promise<ApiResponse<Event>> {
    const response = await apiClient.patch<ApiResponseInternal<EventResponse>>(
      `/admin/events/${id}/status`,
      { status },
    );

    return {
      success: response.data.success,
      data: mapEventResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Upload banner image
   */
  async uploadBanner(
    id: string,
    imageFile: File,
  ): Promise<ApiResponse<Event>> {
    const formData = new FormData();
    formData.append("banner", imageFile);

    const response = await apiClient.post<ApiResponseInternal<EventResponse>>(
      `/admin/events/${id}/banner`,
      formData,
    );

    return {
      success: response.data.success,
      data: mapEventResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get list of published events (public)
   */
  async getPublicEvents(filters?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<ApiResponse<Event[]>> {
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

    const response = await apiClient.get<
      ApiResponseInternal<EventResponse[]>
    >(`/events?${params.toString()}`);

    const events: Event[] = (response.data.data ?? []).map(mapEventResponse);

    return {
      success: response.data.success,
      data: events,
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },

  /**
   * Get published event by ID (public)
   */
  async getPublicEventById(id: string): Promise<ApiResponse<Event>> {
    const response = await apiClient.get<ApiResponseInternal<EventResponse>>(
      `/events/detail/${id}`,
    );

    return {
      success: response.data.success,
      data: mapEventResponse(response.data.data),
      meta: response.data.meta,
      timestamp: response.data.timestamp,
      request_id: response.data.request_id,
    };
  },
};
