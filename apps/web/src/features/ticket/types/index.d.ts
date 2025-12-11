import type { ApiResponse } from "@/types/api";

// Event types
export interface Event {
  id: string;
  event_name: string;
  description?: string;
  banner_image?: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

// Ticket Category types
export interface TicketCategory {
  id: string;
  event_id: string;
  event?: Event;
  category_name: string;
  price: number;
  quota: number;
  limit_per_user: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketCategoryRequest {
  event_id: string;
  category_name: string;
  price: number;
  quota: number;
  limit_per_user: number;
}

export interface UpdateTicketCategoryRequest {
  category_name?: string;
  price?: number;
  quota?: number;
  limit_per_user?: number;
}

// Schedule types
export interface Schedule {
  id: string;
  event_id: string;
  event?: Event;
  date: string;
  session_name: string;
  start_time: string;
  end_time: string;
  artist_name?: string;
  rundown?: string;
  capacity: number;
  remaining_seat: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleRequest {
  event_id: string;
  date: string;
  session_name: string;
  start_time: string;
  end_time: string;
  artist_name?: string;
  rundown?: string;
  capacity: number;
  remaining_seat?: number;
}

export interface UpdateScheduleRequest {
  date?: string;
  session_name?: string;
  start_time?: string;
  end_time?: string;
  artist_name?: string;
  rundown?: string;
  capacity?: number;
  remaining_seat?: number;
}

// Order types
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "CANCELED" | "REFUNDED";

export interface Order {
  id: string;
  user_id: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  order_code: string;
  schedule_id: string;
  schedule?: Schedule;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  midtrans_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ListOrdersRequest {
  page?: number;
  per_page?: number;
  payment_status?: PaymentStatus;
  user_id?: string;
  schedule_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateOrderRequest {
  payment_status?: PaymentStatus;
  payment_method?: string;
  midtrans_transaction_id?: string;
}

// Re-export for convenience
export type { ApiResponse } from "@/types/api";


