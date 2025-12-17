import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRoleFromToken } from "./src/lib/jwt";

/**
 * Middleware proxy function for Next.js 16+
 * Handles authentication and role-based access control
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Extract locale from pathname (e.g., /en/admin/dashboard -> en)
  const pathSegments = pathname.split("/");
  const locale =
    pathSegments.find((segment) => segment && ["en", "id"].includes(segment)) ??
    "en";
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  // If accessing root and already authenticated, redirect to default-locale home
  if (pathname === "/" && token) {
    const target = "/en"; // default locale is "en"
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Protected admin routes (moved from /admin/* to root level)
  const protectedAdminRoutes = [
    "/dashboard",
    "/tickets-management",
    "/settings",
    "/merchandise-management",
    "/attendance",
    "/attendees-management",
    "/events-management",
    "/users-management",
    "/gates-management",
  ];

  // Check if accessing protected admin routes
  const isProtectedRoute = protectedAdminRoutes.some((route) =>
    pathWithoutLocale.startsWith(route),
  );

  if (isProtectedRoute) {
    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode token to get role
    const role = getRoleFromToken(token);

    // Only "admin" or "super_admin" role can access protected routes
    if (role !== "admin" && role !== "super_admin") {
      // Redirect to landing page if not admin
      const homeUrl = new URL(`/${locale}`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Legacy admin routes (still support for backward compatibility)
  if (pathWithoutLocale.startsWith("/admin")) {
    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode token to get role
    const role = getRoleFromToken(token);

    // Only "admin" role can access admin routes
    if (role !== "admin") {
      // Redirect to landing page if not admin
      const homeUrl = new URL(`/${locale}`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Check if accessing staff routes
  if (pathWithoutLocale.startsWith("/staff")) {
    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode token to get role
    const role = getRoleFromToken(token);

    // Only "staff_ticket" role can access staff routes
    if (role !== "staff_ticket") {
      // Redirect to landing page if not staff_ticket
      const homeUrl = new URL(`/${locale}`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // For other routes, let client-side handle auth
  // This prevents flash of login page during hard refresh
  return NextResponse.next();
}
