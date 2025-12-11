import type { ApiResponse } from "@/types/api";

// Menu domain types
export interface Menu {
  id: string;
  parent_id?: string | null;
  code: string;
  label: string;
  icon?: string;
  path?: string;
  order_index: number;
  permission_code?: string;
  is_active: boolean;
  children?: Menu[];
  created_at: string;
  updated_at: string;
}

export interface CreateMenuRequest {
  parent_id?: string | null;
  code: string;
  label: string;
  icon?: string;
  path?: string;
  order_index?: number;
  permission_code?: string;
  is_active?: boolean;
}

export interface UpdateMenuRequest {
  parent_id?: string | null;
  code?: string;
  label?: string;
  icon?: string;
  path?: string;
  order_index?: number;
  permission_code?: string;
  is_active?: boolean;
}

// Re-export for convenience
export type { ApiResponse } from "@/types/api";
