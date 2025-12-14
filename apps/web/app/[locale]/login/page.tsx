"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { LoginForm } from "@/features/auth/components/login-form";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role?.toLowerCase() ?? "";
      
      // Redirect based on role
      if (userRole === "admin" || userRole === "super_admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "staff_ticket" || userRole === "gate_staff") {
        router.push("/staff/dashboard");
      } else {
        // Guest or other roles - redirect to landing page (no dashboard for guest)
        router.push("/");
      }
    }
  }, [isAuthenticated, user, router]);

  // Don't render login form if user is already authenticated (redirect will happen)
  if (isAuthenticated && user) {
    return null;
  }

  return <LoginForm />;
}
