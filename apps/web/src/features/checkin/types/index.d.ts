export type CheckInStatus = "SUCCESS" | "FAILED" | "DUPLICATE";

export interface CheckIn {
  readonly id: string;
  readonly order_item_id: string;
  readonly order_item?: OrderItem;
  readonly qr_code: string;
  readonly gate_id?: string;
  readonly staff_id: string;
  readonly staff?: User;
  readonly status: CheckInStatus;
  readonly location?: string;
  readonly ip_address?: string;
  readonly user_agent?: string;
  readonly checked_in_at: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface OrderItem {
  readonly id: string;
  readonly order_id: string;
  readonly order?: Order;
  readonly category_id: string;
  readonly category?: TicketCategory;
  readonly qr_code: string;
  readonly status: TicketStatus;
  readonly check_in_time?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export type TicketStatus = "UNPAID" | "PAID" | "CHECKED-IN" | "CANCELED" | "REFUNDED";

export interface Order {
  readonly id: string;
  readonly user_id: string;
  readonly user?: User;
  readonly order_code: string;
  readonly schedule_id: string;
  readonly schedule?: Schedule;
  readonly total_amount: number;
  readonly payment_status: PaymentStatus;
  readonly payment_method?: string;
  readonly midtrans_transaction_id?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "CANCELED" | "REFUNDED";

export interface Schedule {
  readonly id: string;
  readonly event_id: string;
  readonly event?: Event;
  readonly date: string;
  readonly start_time: string;
  readonly end_time?: string;
  readonly venue?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Event {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly event_date: string;
  readonly location?: string;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface TicketCategory {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly total_quota: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar_url?: string;
  readonly role_id: string;
  readonly role?: Role;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Role {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly is_admin: boolean;
  readonly can_login_admin: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ValidateQRCodeRequest {
  readonly qr_code: string;
}

export interface ValidateQRCodeResponse {
  readonly valid: boolean;
  readonly order_item_id?: string;
  readonly status?: string;
  readonly message?: string;
  readonly already_used?: boolean;
}

export interface CheckInRequest {
  readonly qr_code: string;
  readonly gate_id?: string;
  readonly location?: string;
}

export interface CheckInResultResponse {
  readonly success: boolean;
  readonly check_in?: CheckIn;
  readonly message: string;
  readonly error_code?: string;
}

export interface CheckInFilters {
  readonly order_item_id?: string;
  readonly gate_id?: string;
  readonly staff_id?: string;
  readonly status?: CheckInStatus;
  readonly start_date?: string;
  readonly end_date?: string;
  readonly page?: number;
  readonly per_page?: number;
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
  };
  readonly timestamp: string;
  readonly request_id: string;
}

