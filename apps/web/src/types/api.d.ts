// API Response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  timestamp: string;
  request_id: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field_errors?: Array<{
    field: string;
    code: string;
    message: string;
    constraint?: Record<string, unknown>;
  }>;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  filters?: Record<string, unknown>;
  sort?: SortMeta;
  tenant_id?: string;
  outlet_id?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  [key: string]: unknown;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_page?: number;
  prev_page?: number;
}

export interface SortMeta {
  field: string;
  order: "asc" | "desc";
}


