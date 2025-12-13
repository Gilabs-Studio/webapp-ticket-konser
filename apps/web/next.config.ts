import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // HSTS
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },

          // CSP (optimized for Next.js)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' https: data: blob:",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },

          // Clickjacking
          { key: "X-Frame-Options", value: "DENY" },

          // MIME Sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Feature permissions
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "fullscreen=(self)",
              "payment=()",
              "usb=()",
            ].join(", "),
          },

          // Cross-Origin protections
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },

          // COEP disabled for compatibility
          // { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },

      // static asset caching
      {
        source: "/:path*.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
