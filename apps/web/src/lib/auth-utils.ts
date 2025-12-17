/**
 * Utility functions for authentication and token management
 */

import { deleteCookie } from "./cookie";

/**
 * Clear all authentication data and redirect to login
 * This function is used when token expires or refresh fails
 * 
 * @param redirectPath - Path to redirect after logout (default: "/login")
 */
export function forceLogout(redirectPath: string = "/login"): void {
  if (typeof window === "undefined") {
    return;
  }

  // Clear all storage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  deleteCookie("token");

  // Clear Zustand auth store
  import("@/features/auth/stores/useAuthStore").then(({ useAuthStore }) => {
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  });

  // Clear rate limit store
  import("@/lib/stores/useRateLimitStore").then(({ useRateLimitStore }) => {
    useRateLimitStore.getState().clearResetTime();
  });

  // Redirect to login
  // Use window.location for absolute redirect to ensure clean state
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const locale = pathParts[0] || "en";
  const loginPath = `/${locale}${redirectPath}`;
  
  // Small delay to ensure state is cleared before redirect
  setTimeout(() => {
    window.location.href = loginPath;
  }, 100);
}

/**
 * Check if token is expired based on JWT payload
 * Note: This is a client-side check, server will validate the actual token
 * 
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return true;
    }

    // Decode payload (base64)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expiration
    if (!payload.exp) {
      return false; // No expiration, assume valid
    }

    // Check if expired (exp is in seconds, Date.now() is in milliseconds)
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Add 5 second buffer to account for clock skew
    return currentTime >= expirationTime - 5000;
  } catch (error) {
    // If we can't parse the token, consider it expired
    return true;
  }
}

/**
 * Get token expiration time
 * 
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if token is invalid
 */
export function getTokenExpiration(token: string | null): number | null {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return null;
    }

    return payload.exp * 1000;
  } catch (error) {
    return null;
  }
}

