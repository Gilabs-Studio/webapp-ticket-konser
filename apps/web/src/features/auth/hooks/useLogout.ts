"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "../stores/useAuthStore";
import { authService } from "../services/authService";
import { deleteCookie } from "@/lib/cookie";

/**
 * Hook untuk handle logout dengan cleanup yang lengkap
 * 
 * Flow logout:
 * 1. Notify backend (optional, bisa di-ignore jika gagal)
 * 2. Clear semua storage (localStorage, cookie)
 * 3. Clear Zustand store
 * 4. Redirect ke login
 */
export function useLogout() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const handleLogout = useCallback(async () => {
    try {
      // Notify backend (optional)
      await authService.logout();
    } catch (error) {
      // Ignore logout errors - continue with cleanup
    } finally {
      // Clear all storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        // Remove cookie
        deleteCookie("token");
      }

      // Clear Zustand store
      setUser(null);
      setToken(null);
      useAuthStore.setState({
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });

      // Redirect to login
      router.push("/login");
    }
  }, [router, setUser, setToken]);

  return handleLogout;
}
