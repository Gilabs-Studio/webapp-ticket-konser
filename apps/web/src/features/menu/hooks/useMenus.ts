"use client";

import { useQuery } from "@tanstack/react-query";
import { menuService } from "../services/menuService";

export function useMenus() {
  return useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const response = await menuService.getMenusByRole();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch menus");
      }
      return response.data;
    },
  });
}
