export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "CANCELED" | "REFUNDED";

export interface OrderUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar_url?: string;
}

export interface OrderEvent {
  readonly id: string;
  readonly event_name: string;
}

export interface OrderSchedule {
  readonly id: string;
  readonly event_id: string;
  readonly event?: OrderEvent;
  readonly date: string;
  readonly session_name: string;
  readonly start_time: string;
  readonly end_time: string;
  readonly artist_name?: string;
  readonly rundown?: string;
  readonly capacity: number;
  readonly remaining_seat: number;
}

export interface Order {
  readonly id: string;
  readonly user_id: string;
  readonly user?: OrderUser;
  readonly order_code: string;
  readonly schedule_id: string;
  readonly schedule?: OrderSchedule;
  readonly total_amount: number;
  readonly total_amount_formatted?: string;
  readonly payment_status: PaymentStatus;
  readonly payment_method?: string;
  readonly midtrans_transaction_id?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly meta?: {
    readonly pagination?: {
      readonly page: number;
      readonly per_page: number;
      readonly total: number;
      readonly total_pages: number;
      readonly has_next: boolean;
      readonly has_prev: boolean;
      readonly next_page?: number;
      readonly prev_page?: number;
    };
    readonly filters?: Record<string, unknown>;
  };
  readonly timestamp: string;
  readonly request_id: string;
}

export interface OrderFilters {
  readonly page?: number;
  readonly per_page?: number;
  readonly payment_status?: PaymentStatus;
  readonly user_id?: string;
  readonly schedule_id?: string;
  readonly start_date?: string;
  readonly end_date?: string;
}

export interface UpdateOrderRequest {
  readonly payment_status?: PaymentStatus;
  readonly payment_method?: string;
  readonly midtrans_transaction_id?: string;
}

