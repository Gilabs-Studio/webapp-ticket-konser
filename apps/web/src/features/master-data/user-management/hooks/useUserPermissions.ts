"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { authService } from "@/features/auth/services/authService";
import { useLogout } from "@/features/auth/hooks/useLogout";
import type { AxiosError } from "axios";
import type { Menu, Permission } from "@/features/auth/types";

export interface MenuWithActions extends Menu {
  children?: MenuWithActions[];
  actions?: Action[];
}

export interface Action {
  id: string;
  code: string; // e.g., "ticket.create", "user.read"
  name: string;
  access: boolean;
}

export interface UserPermissionsResponse {
  menus: MenuWithActions[];
  permissions: Permission[];
}

/**
 * Hook untuk fetch user permissions dari API
 * Menggunakan endpoint /auth/me/menus-permissions
 */
export function useUserPermissions() {
  const router = useRouter();
  const { user } = useAuthStore();
  const handleLogout = useLogout();

  const query = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await authService.getMenusPermissions();
      
      if (!response.success || !response.data) {
        throw new Error("Failed to fetch permissions");
      }

      const allPermissions = response.data.permissions || [];
      
      // Create a map of permissions by code for quick lookup
      const permissionMap = new Map<string, Permission>();
      allPermissions.forEach((perm) => {
        permissionMap.set(perm.code, perm);
      });

      // Transform menus to include actions from permissions
      // Map permissions to menu actions based on permission_code
      const transformMenu = (menu: Menu): MenuWithActions => {
        // Find permissions that match this menu's permission_code or are related
        const menuPermissions: Permission[] = [];
        
        if (menu.permission_code) {
          // Exact match
          const exactMatch = permissionMap.get(menu.permission_code);
          if (exactMatch) {
            menuPermissions.push(exactMatch);
          }

          // Resource-based match (e.g., menu.permission_code = "ticket", perm.code = "ticket.create")
          const resource = menu.permission_code.split(".")[0];
          allPermissions.forEach((perm) => {
            if (perm.code.startsWith(resource + ".") && !menuPermissions.includes(perm)) {
              menuPermissions.push(perm);
            }
          });
        }

        const actions: Action[] = menuPermissions.map((perm) => ({
          id: perm.id,
          code: perm.code,
          name: perm.name,
          access: true, // If permission exists in user's permissions, they have access
        }));

        const menuWithActions: MenuWithActions = {
          ...menu,
          actions: actions.length > 0 ? actions : undefined,
        };

        // Recursively transform children
        if (menu.children && menu.children.length > 0) {
          menuWithActions.children = menu.children.map(transformMenu);
        }

        return menuWithActions;
      };

      const menus: MenuWithActions[] = (response.data.menus || []).map(transformMenu);

      return {
        menus,
        permissions: allPermissions,
      } as UserPermissionsResponse;
    },
    enabled: !!user?.id,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle 404 error - user not found, clear auth and redirect
  useEffect(() => {
    if (query.error) {
      const error = query.error as AxiosError<{
        success: boolean;
        error?: {
          code: string;
          message: string;
        };
      }>;

      // If user not found (404) or USER_NOT_FOUND error, clear auth state
      if (
        error.response?.status === 404 ||
        error.response?.data?.error?.code === "USER_NOT_FOUND"
      ) {
        handleLogout();
      }
    }
  }, [query.error, handleLogout]);

  return query;
}

