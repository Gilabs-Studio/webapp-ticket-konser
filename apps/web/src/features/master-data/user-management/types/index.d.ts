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

// Role Types
export interface CreateRoleFormData {
  code: string;
  name: string;
  description?: string;
  is_admin?: boolean;
  can_login_admin?: boolean;
}

export interface UpdateRoleFormData {
  name?: string;
  description?: string;
  is_admin?: boolean;
  can_login_admin?: boolean;
}

export interface ListRolesParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface ListRolesResponse {
  success: boolean;
  data: Role[];
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

export interface RoleResponse {
  success: boolean;
  data: Role;
  meta: Record<string, unknown>;
  timestamp: string;
  request_id: string;
}

export interface RolePermission {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
}

export interface RoleWithPermissions extends Role {
  permissions?: RolePermission[];
}

export interface RoleWithPermissionsResponse {
  success: boolean;
  data: RoleWithPermissions;
  meta: Record<string, unknown>;
  timestamp: string;
  request_id: string;
}

export interface AssignPermissionsFormData {
  permission_ids: string[];
}

// Permission Types
export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionFormData {
  code: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface UpdatePermissionFormData {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface ListPermissionsParams {
  page?: number;
  per_page?: number;
  search?: string;
  resource?: string;
}

export interface ListPermissionsResponse {
  success: boolean;
  data: Permission[];
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

export interface PermissionResponse {
  success: boolean;
  data: Permission;
  meta: Record<string, unknown>;
  timestamp: string;
  request_id: string;
}

