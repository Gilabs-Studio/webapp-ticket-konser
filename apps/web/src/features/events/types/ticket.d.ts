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
  readonly category?: {
    readonly id: string;
    readonly event_id: string;
    readonly event?: {
      readonly id: string;
      readonly event_name: string;
      readonly start_date?: string;
      readonly end_date?: string;
    };
  };
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

// E-Ticket (Order Item) types
export type ETicketStatus = "UNPAID" | "PAID" | "CHECKED-IN" | "CANCELED" | "REFUNDED";

export interface ETicket {
  readonly id: string;
  readonly order_id: string;
  readonly category_id: string;
  readonly qr_code: string;
  readonly status: ETicketStatus;
  readonly check_in_time?: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly order?: {
    readonly id: string;
    readonly order_code: string;
    readonly user_id: string;
    readonly schedule_id: string;
    readonly total_amount: number;
    readonly payment_status: string;
    readonly buyer_name: string;
    readonly buyer_email: string;
    readonly buyer_phone: string;
    readonly event_name_snapshot: string;
    readonly schedule_name_snapshot: string;
    readonly category_name_snapshot: string;
    readonly created_at: string;
    readonly user?: {
      readonly id: string;
      readonly name: string;
      readonly email: string;
    };
    readonly schedule?: {
      readonly id: string;
      readonly event_id: string;
      readonly event?: {
        readonly id: string;
        readonly event_name: string;
        readonly start_date: string;
        readonly end_date: string;
      };
    };
  };
  readonly category?: {
    readonly id: string;
    readonly category_name: string;
    readonly price: number;
    readonly quota: number;
    readonly event_id: string;
  };
}

export interface GenerateTicketsRequest {
  readonly categories: string[];
  readonly quantities: number[];
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


