"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { authService } from "../services/authService";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleSuccess = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [router, clearAuth]);

  const handleError = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [router, clearAuth]);

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: handleSuccess,
    onError: handleError,
  });
}
