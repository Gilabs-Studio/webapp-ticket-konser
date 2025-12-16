"use client";

import { useMemo } from "react";
import { useUserPermissions, type MenuWithActions } from "./useUserPermissions";

/**
 * Recursive function to find action by code in menu tree
 */
function findActionByCode(
  menus: MenuWithActions[],
  code: string,
): { code: string; access: boolean } | null {
  for (const menu of menus) {
    // Check actions in current menu
    if (menu.actions) {
      const action = menu.actions.find((a) => a.code === code);
      if (action) {
        return { code: action.code, access: action.access };
      }
    }

    // Recursively check children
    if (menu.children && menu.children.length > 0) {
      const found = findActionByCode(menu.children, code);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Hook untuk check apakah user memiliki permission tertentu
 * 
 * @param permissionCode - Permission code yang ingin dicek (e.g., "ticket.create", "user.read")
 * @returns boolean - true jika user memiliki permission, false jika tidak
 * 
 * @example
 * ```tsx
 * const hasCreatePermission = useHasPermission("ticket.create");
 * const hasEditPermission = useHasPermission("user.update");
 * 
 * {hasCreatePermission && (
 *   <Button onClick={handleCreate}>Create</Button>
 * )}
 * ```
 */
export function useHasPermission(permissionCode: string): boolean {
  const { data: permissionsData } = useUserPermissions();

  const hasPermission = useMemo(() => {
    if (!permissionsData?.menus) {
      return false;
    }

    const action = findActionByCode(permissionsData.menus, permissionCode);
    return action?.access ?? false;
  }, [permissionsData, permissionCode]);

  return hasPermission;
}

