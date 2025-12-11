"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { authService } from "../services/authService";
import type { LoginResponseData } from "../types";

export function useRefreshSession() {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSuccess = useCallback(
    (data: LoginResponseData) => {
      const { user, token, refresh_token } = data;
      setAuth(user, token, refresh_token);
    },
    [setAuth]
  );

  const handleError = useCallback(() => {
    // If refresh fails, clear auth
    useAuthStore.getState().clearAuth();
  }, []);

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authService.refreshToken(refreshToken);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Token refresh failed");
      }

      return response.data;
    },
    onSuccess: handleSuccess,
    onError: handleError,
  });
}
