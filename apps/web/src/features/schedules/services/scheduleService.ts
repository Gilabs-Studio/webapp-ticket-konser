import apiClient from "@/lib/api-client";
import type { Schedule } from "../types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: unknown;
  timestamp: string;
  request_id: string;
}

export const scheduleService = {
  /**
   * Get schedule by ID
   */
  async getScheduleById(id: string): Promise<ApiResponse<Schedule>> {
    const response = await apiClient.get<ApiResponse<Schedule>>(
      `/admin/schedules/${id}`,
    );
    return response.data;
  },

  /**
   * Get all schedules
   */
  async getSchedules(): Promise<ApiResponse<Schedule[]>> {
    const response = await apiClient.get<ApiResponse<Schedule[]>>(
      "/admin/schedules",
    );
    return response.data;
  },

  /**
   * Get schedules by event ID (admin)
   */
  async getSchedulesByEventId(eventId: string): Promise<ApiResponse<Schedule[]>> {
    const response = await apiClient.get<ApiResponse<Schedule[]>>(
      `/admin/schedules/event/${eventId}`,
    );
    return response.data;
  },

  /**
   * Get schedules by event ID (public - for guest)
   */
  async getSchedulesByEventIdPublic(eventId: string): Promise<ApiResponse<Schedule[]>> {
    const response = await apiClient.get<ApiResponse<Schedule[]>>(
      `/events/${eventId}/schedules`,
    );
    return response.data;
  },

  /**
   * Create schedule
   */
  async createSchedule(data: {
    event_id: string;
    date: string;
    session_name: string;
    start_time: string;
    end_time: string;
    artist_name?: string;
    rundown?: string;
    capacity: number;
    remaining_seat?: number;
  }): Promise<ApiResponse<Schedule>> {
    const response = await apiClient.post<ApiResponse<Schedule>>(
      "/admin/schedules",
      data,
    );
    return response.data;
  },

  /**
   * Update schedule
   */
  async updateSchedule(
    id: string,
    data: {
      date?: string;
      session_name?: string;
      start_time?: string;
      end_time?: string;
      artist_name?: string;
      rundown?: string;
      capacity?: number;
      remaining_seat?: number;
    },
  ): Promise<ApiResponse<Schedule>> {
    const response = await apiClient.put<ApiResponse<Schedule>>(
      `/admin/schedules/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete schedule
   */
  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/admin/schedules/${id}`);
  },
};


