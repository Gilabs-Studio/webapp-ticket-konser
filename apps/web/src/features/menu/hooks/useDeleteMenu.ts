"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "../services/menuService";

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await menuService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
}
