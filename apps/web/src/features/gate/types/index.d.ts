export type GateStatus = "ACTIVE" | "INACTIVE";

export interface Gate {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly location?: string;
  readonly description?: string;
  readonly is_vip: boolean;
  readonly status: GateStatus;
  readonly capacity: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar_url?: string;
  readonly role: string;
}

export interface AssignStaffToGateRequest {
  readonly staff_id: string;
}

export interface CreateGateRequest {
  readonly code: string;
  readonly name: string;
  readonly location?: string;
  readonly description?: string;
  readonly is_vip?: boolean;
  readonly status?: GateStatus;
  readonly capacity?: number;
}

export interface UpdateGateRequest {
  readonly code?: string;
  readonly name?: string;
  readonly location?: string;
  readonly description?: string;
  readonly is_vip?: boolean;
  readonly status?: GateStatus;
  readonly capacity?: number;
}

export interface GateFilters {
  readonly status?: GateStatus;
  readonly is_vip?: boolean;
  readonly search?: string;
  readonly page?: number;
  readonly per_page?: number;
}

export interface AssignTicketToGateRequest {
  readonly order_item_id: string;
  readonly gate_id: string;
}

export interface GateCheckInRequest {
  readonly qr_code: string;
  readonly gate_id: string;
  readonly location?: string;
}

export interface GateStatistics {
  readonly gate_id: string;
  readonly gate_code: string;
  readonly gate_name: string;
  readonly total_check_ins: number;
  readonly today_check_ins: number;
  readonly vip_check_ins: number;
  readonly regular_check_ins: number;
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
