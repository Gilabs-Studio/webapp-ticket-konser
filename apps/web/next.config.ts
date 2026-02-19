import type { NextConfig } from "next";

// Try to load the next-intl plugin at runtime. If it's not installed
// (for example during certain CI/build environments), gracefully
// fall back to an identity wrapper so the build doesn't fail.
let withNextIntl: (cfg: NextConfig) => NextConfig = (cfg) => cfg;

try {
  // require is used intentionally to avoid parse-time failures when the
  // optional dependency is not present in the environment.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
  const pluginModule = require("next-intl/plugin");

  // support both CJS and ESM shapes
  const createPluginCandidate = pluginModule && ((pluginModule as { default?: unknown }).default ?? pluginModule);

  if (typeof createPluginCandidate === "function") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const plugin = createPluginCandidate("./src/i18n/request.ts");
    if (typeof plugin === "function") {
      withNextIntl = plugin as (cfg: NextConfig) => NextConfig;
    }
  }
} catch (err) {
  // If the error is anything other than a missing module, rethrow it so
  // we don't silently swallow unexpected issues. For a missing module,
  // warn and continue with identity wrapper.
  const code = (err as NodeJS.ErrnoException | undefined)?.code;
  // eslint-disable-next-line no-console
  if (code === "MODULE_NOT_FOUND") {
    // eslint-disable-next-line no-console
    console.warn("next-intl/plugin not found — skipping Next Intl plugin");
  } else {
    throw err;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/uploads/**",
      },
    ],
  },
  async headers() {
    return [
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

  // Fix HMR issues with route resolution
  experimental: {
    serverComponentsHmrCache: true,
  },
};

export default withNextIntl(nextConfig);
