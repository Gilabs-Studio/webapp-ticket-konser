/**
 * JWT utility functions for decoding tokens (without verification)
 * Note: This is for client-side role checking only.
 * Actual token verification should be done on the server.
 */

interface JWTPayload {
  user_id?: string;
  email?: string;
  role?: string;
  role_id?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
}

/**
 * Decodes base64 string (compatible with Edge Runtime)
 * Next.js 16 Edge Runtime supports Buffer, so we can use it directly
 * @param base64 Base64 string
 * @returns Decoded string
 */
function base64Decode(base64: string): string {
  // Replace URL-safe characters
  const normalized = base64.replaceAll("-", "+").replaceAll("_", "/");
  // Add padding if needed
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  
  // Buffer is available in Next.js Edge Runtime
  return Buffer.from(padded, "base64").toString("utf-8");
}

/**
 * Decodes a JWT token without verification
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64 payload (second part)
    const payload = parts[1];
    const decoded = base64Decode(payload);
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Gets the role from a JWT token
 * @param token JWT token string
 * @returns Role string or null if not found
 */
export function getRoleFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.role ?? null;
}
