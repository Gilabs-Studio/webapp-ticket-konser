"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { authService } from "../services/authService";
import type { LoginFormData } from "../schemas/login.schema";
import type { LoginResponseData } from "../types";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSuccess = useCallback(
    (data: LoginResponseData) => {
      const { user, token, refresh_token } = data;
      setAuth(user, token, refresh_token);
      router.push("/dashboard");
    },
    [router, setAuth]
  );

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Login failed");
      }

      return response.data;
    },
    onSuccess: handleSuccess,
  });
}
