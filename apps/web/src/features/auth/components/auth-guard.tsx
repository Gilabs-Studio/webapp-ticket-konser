"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";

interface AuthGuardProps {
  readonly children: React.ReactNode;
  readonly redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, token, router, redirectTo]);

  if (!isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
}
