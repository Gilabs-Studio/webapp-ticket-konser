import apiClient from "@/lib/api-client";
import type {
  TicketCategory,
  CreateTicketCategoryRequest,
  UpdateTicketCategoryRequest,
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  Order,
  ListOrdersRequest,
  UpdateOrderRequest,
  ApiResponse,
} from "../types";

export const ticketService = {
  // Ticket Category
  async getTicketCategories(): Promise<ApiResponse<TicketCategory[]>> {
    const response = await apiClient.get<ApiResponse<TicketCategory[]>>("/admin/ticket-categories");
    return response.data;
  },

  async getTicketCategoryById(id: string): Promise<ApiResponse<TicketCategory>> {
    const response = await apiClient.get<ApiResponse<TicketCategory>>(`/admin/ticket-categories/${id}`);
    return response.data;
  },

  async getTicketCategoriesByEventId(eventId: string): Promise<ApiResponse<TicketCategory[]>> {
    const response = await apiClient.get<ApiResponse<TicketCategory[]>>(`/admin/ticket-categories/event/${eventId}`);
    return response.data;
  },

  async createTicketCategory(data: CreateTicketCategoryRequest): Promise<ApiResponse<TicketCategory>> {
    const response = await apiClient.post<ApiResponse<TicketCategory>>("/admin/ticket-categories", data);
    return response.data;
  },

  async updateTicketCategory(id: string, data: UpdateTicketCategoryRequest): Promise<ApiResponse<TicketCategory>> {
    const response = await apiClient.put<ApiResponse<TicketCategory>>(`/admin/ticket-categories/${id}`, data);
    return response.data;
  },

  async deleteTicketCategory(id: string): Promise<void> {
    await apiClient.delete(`/admin/ticket-categories/${id}`);
  },

  // Schedule
  async getSchedules(): Promise<ApiResponse<Schedule[]>> {
    const response = await apiClient.get<ApiResponse<Schedule[]>>("/admin/schedules");
    return response.data;
  },

  async getScheduleById(id: string): Promise<ApiResponse<Schedule>> {
    const response = await apiClient.get<ApiResponse<Schedule>>(`/admin/schedules/${id}`);
    return response.data;
  },

  async getSchedulesByEventId(eventId: string): Promise<ApiResponse<Schedule[]>> {
    const response = await apiClient.get<ApiResponse<Schedule[]>>(`/admin/schedules/event/${eventId}`);
    return response.data;
  },

  async createSchedule(data: CreateScheduleRequest): Promise<ApiResponse<Schedule>> {
    const response = await apiClient.post<ApiResponse<Schedule>>("/admin/schedules", data);
    return response.data;
  },

  async updateSchedule(id: string, data: UpdateScheduleRequest): Promise<ApiResponse<Schedule>> {
    const response = await apiClient.put<ApiResponse<Schedule>>(`/admin/schedules/${id}`, data);
    return response.data;
  },

  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/admin/schedules/${id}`);
  },

  // Order
  async getOrders(params?: ListOrdersRequest): Promise<ApiResponse<Order[]>> {
    const response = await apiClient.get<ApiResponse<Order[]>>("/admin/orders", { params });
    return response.data;
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return response.data;
  },

  async getOrderByOrderCode(orderCode: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponse<Order>>(`/admin/orders/code/${orderCode}`);
    return response.data;
  },

  async updateOrder(id: string, data: UpdateOrderRequest): Promise<ApiResponse<Order>> {
    const response = await apiClient.put<ApiResponse<Order>>(`/admin/orders/${id}`, data);
    return response.data;
  },

  async deleteOrder(id: string): Promise<void> {
    await apiClient.delete(`/admin/orders/${id}`);
  },
};


