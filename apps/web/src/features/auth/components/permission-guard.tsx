"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useUserPermissions } from "@/features/master-data/user-management/hooks/useUserPermissions";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";

interface PermissionGuardProps {
  readonly children: React.ReactNode;
  readonly requiredPermission: string;
  readonly fallbackUrl?: string;
}

/**
 * PermissionGuard component that checks if user has required permission
 * If not, redirects to block page
 */
export function PermissionGuard({
  children,
  requiredPermission,
  fallbackUrl = "/block",
}: PermissionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: permissionsData, isLoading } = useUserPermissions();
  const hasPermission = useHasPermission(requiredPermission);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) {
      return;
    }

    // If permissions loaded but user doesn't have permission, redirect
    if (permissionsData && !hasPermission) {
      // Get current locale from pathname (pathname format: /en/... or /id/...)
      const pathParts = pathname.split("/").filter(Boolean);
      const locale = pathParts[0] || "en";

      // Ensure fallbackUrl is absolute (starts with /)
      const absoluteBlockUrl = fallbackUrl.startsWith("/")
        ? fallbackUrl
        : `/${fallbackUrl}`;

      // Construct absolute path with locale
      const blockPath = `/${locale}${absoluteBlockUrl}`;

      // Use window.location for absolute redirect to avoid routing issues
      if (typeof window !== "undefined") {
        window.location.href = blockPath;
      } else {
        router.replace(blockPath);
      }
    }
  }, [
    hasPermission,
    isLoading,
    permissionsData,
    router,
    pathname,
    fallbackUrl,
  ]);

  // Show nothing while checking permissions
  if (isLoading) {
    return null;
  }

  // If no permission, don't render children (redirect will happen)
  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}
