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

export type OrderStatus = "completed" | "pending" | "failed" | "canceled" | "refunded";

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
