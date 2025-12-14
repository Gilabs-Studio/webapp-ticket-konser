import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import type { Menu } from "../types";

interface UseMenusOptions {
  enabled?: boolean;
}

export function useMenus(options?: UseMenusOptions) {
  return useQuery({
    queryKey: ["menus-permissions"],
    queryFn: async () => {
      const response = await authService.getMenusPermissions();
      return response.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Helper function to categorize menus into Overview and Management
 * Overview: dashboard, tickets, events (main operational items)
 * Management: settings, users (administrative items)
 */
export function categorizeMenus(menus: Menu[]): {
  overview: Menu[];
  management: Menu[];
} {
  const overview: Menu[] = [];
  const management: Menu[] = [];

  // Sort menus by order_index
  const sortedMenus = [...menus].sort(
    (a, b) => a.order_index - b.order_index,
  );

  for (const menu of sortedMenus) {
    // Only include active menus
    if (!menu.is_active) continue;

    // Skip scanner and check-ins menus (these are accessed via profile dropdown, not sidebar)
    if (menu.code === "scanner" || menu.code === "check-ins") {
      continue;
    }

    // Categorize based on menu code
    if (
      menu.code === "dashboard" ||
      menu.code === "event-management" ||
      menu.code === "ticket-management"
    ) {
      overview.push(menu);
    } else if (
      menu.code === "user-management" ||
      menu.code === "settings"
    ) {
      management.push(menu);
    } else {
      // Default to overview for unknown menu codes
      overview.push(menu);
    }
  }

  return { overview, management };
}
