export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role_id: string;
  role?: Role;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_admin: boolean;
  can_login_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserFormData {
  email: string;
  password: string;
  name: string;
  role_id: string;
  status?: "active" | "inactive";
}

export interface UpdateUserFormData {
  email?: string;
  name?: string;
  role_id?: string;
  status?: "active" | "inactive";
}

export interface ListUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  role_id?: string;
}

export interface ListUsersResponse {
  success: boolean;
  data: User[];
  meta: {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
      next_page?: number;
      prev_page?: number;
    };
  };
  timestamp: string;
  request_id: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  meta: Record<string, unknown>;
  timestamp: string;
  request_id: string;
}

