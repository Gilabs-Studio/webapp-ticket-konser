"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Already logged in — send buyers to explore
      if (redirectPath) {
        router.push(decodeURIComponent(redirectPath));
      } else {
        router.push("/explore");
      }
    }
  }, [isAuthenticated, user, router, redirectPath]);

  if (isAuthenticated && user) {
    return null;
  }

  return <RegisterForm redirectPath={redirectPath} />;
}
