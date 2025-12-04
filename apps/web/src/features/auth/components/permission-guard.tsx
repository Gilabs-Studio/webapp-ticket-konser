"use client";

import type React from "react";

interface PermissionGuardProps {
  readonly children: React.ReactNode;
  readonly requiredPermission?: string;
  readonly fallbackUrl?: string;
}

/**
 * PermissionGuard component that checks if user has required permission
 * Simplified version - always allows access for now
 * Can be extended later when permission system is implemented
 */
export function PermissionGuard({
  children,
  requiredPermission,
  fallbackUrl = "/login",
}: PermissionGuardProps) {
  // For now, always allow access
  // TODO: Implement permission checking when permission system is added
  return <>{children}</>;
}
