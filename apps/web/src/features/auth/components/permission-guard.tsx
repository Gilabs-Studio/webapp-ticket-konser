"use client";

import { useAuthStore } from "../stores/useAuthStore";

interface PermissionGuardProps {
  readonly children: React.ReactNode;
  readonly permission: string;
  readonly fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuthStore();
  const permissions = user?.permissions ?? [];

  if (!permissions.includes(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}


