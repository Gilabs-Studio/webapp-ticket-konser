export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refresh_token: string;
    expires_in: number;
  };
  timestamp: string;
  request_id: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Menu {
  id: string;
  parent_id: string | null;
  code: string;
  label: string;
  icon: string;
  path: string;
  order_index: number;
  permission_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface MenusPermissionsResponse {
  success: boolean;
  data: {
    menus: Menu[];
    permissions: Permission[];
  };
  meta: Record<string, unknown>;
  timestamp: string;
  request_id: string;
}
