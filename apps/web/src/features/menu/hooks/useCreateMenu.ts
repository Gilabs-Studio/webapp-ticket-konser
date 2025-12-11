"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "../services/menuService";
import type { CreateMenuFormData } from "../schemas/menu.schema";
import type { CreateMenuRequest } from "../types";

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMenuFormData) => {
      const request: CreateMenuRequest = {
        parent_id: data.parent_id ?? null,
        code: data.code,
        label: data.label,
        icon: data.icon,
        path: data.path,
        order_index: data.order_index,
        permission_code: data.permission_code,
        is_active: data.is_active,
      };

      const response = await menuService.create(request);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to create menu");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
}
