"use client";

import { useQuery } from "@tanstack/react-query";
import { menuService } from "../services/menuService";

export function useMenuList() {
  return useQuery({
    queryKey: ["admin", "menus"],
    queryFn: async () => {
      const response = await menuService.list();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch menus");
      }
      return response.data;
    },
  });
}
