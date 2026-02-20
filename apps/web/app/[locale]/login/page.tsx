"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { getNormalizedRoleCode } from "@/features/auth/utils/role";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // If there's a redirect param, navigate there (from purchase flow etc.)
      if (redirectPath) {
        router.push(decodeURIComponent(redirectPath));
        return;
      }

      const userRole = getNormalizedRoleCode(user.role);

      // Redirect based on role
      if (userRole === "admin" || userRole === "super_admin") {
        router.push("/dashboard");
      } else {
        // Staff (staff_ticket) or Guest/other roles (including former gate_staff) - redirect to landing page
        router.push("/");
      }
    }
  }, [isAuthenticated, user, router, redirectPath]);

  // Don't render login form if user is already authenticated (redirect will happen)
  if (isAuthenticated && user) {
    return null;
  }

  return <LoginForm redirectPath={redirectPath} />;
}
