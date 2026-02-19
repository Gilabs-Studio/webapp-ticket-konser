import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "../stores/useAuthStore";
import { authService } from "../services/authService";
import type { RegisterFormData } from "../schemas/register.schema";
import { setSecureCookie } from "@/lib/cookie";

export function useRegister(redirectPath?: string) {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
      });

      if (response.success && response.data) {
        const { user, token, refresh_token } = response.data;

        if (typeof window !== "undefined") {
          window.localStorage.setItem("token", token);
          window.localStorage.setItem("refreshToken", refresh_token);
          setSecureCookie("token", token);
        }

        setUser(user);
        setToken(token);
        useAuthStore.setState({
          refreshToken: refresh_token,
          isAuthenticated: true,
          error: null,
        });

        // After registration, send buyers to explore page
        if (redirectPath) {
          router.push(decodeURIComponent(redirectPath));
        } else {
          router.push("/explore");
        }
      }
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { error?: { code?: string; message?: string } } };
        message?: string;
      };
      const code = apiError.response?.data?.error?.code;
      if (code === "EMAIL_ALREADY_EXISTS") {
        setError("Email is already registered. Please sign in instead.");
      } else {
        setError(
          apiError.response?.data?.error?.message ||
            apiError.message ||
            "Registration failed. Please try again.",
        );
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { handleRegister, isLoading, error, clearError };
}
