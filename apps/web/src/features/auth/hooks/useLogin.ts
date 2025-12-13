import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "../stores/useAuthStore";
import { authService } from "../services/authService";
import type { LoginFormData } from "../schemas/login.schema";
import type { AuthError } from "../types/errors";
import { useState } from "react";
import { setSecureCookie } from "@/lib/cookie";

export function useLogin() {
  const router = useRouter();
  const {
    setUser,
    setToken,
    isLoading: storeIsLoading,
    error: storeError,
    clearError,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });
      if (response.success && response.data) {
        const { user, token, refresh_token } = response.data;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refresh_token);
          // Set secure cookie for WebSocket and middleware
          setSecureCookie("token", token);
        }
        setUser(user);
        setToken(token);
        useAuthStore.setState({
          refreshToken: refresh_token,
          isAuthenticated: true,
          error: null,
        });
        // Redirect berdasarkan role
        const userRole = user.role?.toLowerCase() ?? "";
        if (userRole === "admin" || userRole === "super_admin") {
          router.push("/admin/dashboard");
        } else if (userRole === "staff_ticket" || userRole === "gate_staff") {
          router.push("/staff/ticket");
        } else {
          // Guest atau role lain - redirect ke landing page
          router.push("/");
        }
      }
    } catch (err) {
      const authError = err as AuthError;
      const errorMessage =
        authError.response?.data?.error?.message ||
        authError.message ||
        "Login failed";
      setError(errorMessage);
      useAuthStore.setState({ isAuthenticated: false, error: errorMessage });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading: isLoading || storeIsLoading,
    error: error || storeError,
    clearError: () => {
      setError(null);
      clearError();
    },
  };
}
