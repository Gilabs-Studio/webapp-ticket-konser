"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "../services/menuService";
import type { UpdateMenuFormData } from "../schemas/menu.schema";
import type { UpdateMenuRequest } from "../types";

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMenuFormData }) => {
      const request: UpdateMenuRequest = {
        parent_id: data.parent_id ?? null,
        code: data.code,
        label: data.label,
        icon: data.icon,
        path: data.path,
        order_index: data.order_index,
        permission_code: data.permission_code,
        is_active: data.is_active,
      };

      const response = await menuService.update(id, request);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to update menu");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
}
