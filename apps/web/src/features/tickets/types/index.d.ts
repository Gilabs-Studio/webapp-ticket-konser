export type TicketStatus = "active" | "low_stock" | "sold_out" | "inactive";

export interface TicketType {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly price_formatted?: string;
  readonly total_quota: number;
  readonly sold: number;
  readonly status: TicketStatus;
}

export type OrderStatus =
  | "completed"
  | "pending"
  | "failed"
  | "canceled"
  | "refunded";

export interface Order {
  readonly id: string;
  readonly order_id: string;
  readonly customer_name: string;
  readonly customer_email?: string;
  readonly tickets: string; // e.g., "2x VIP Pass"
  readonly status: OrderStatus;
  readonly total: number;
  readonly total_formatted?: string;
  readonly created_at?: string;
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


