import type { NextConfig } from "next";
import path from "path";

const webpackAlias = {
  "@native/types": path.resolve(__dirname, "packages/types/src"),
  "@native/ui": path.resolve(__dirname, "packages/ui/src"),
  "@native/utils": path.resolve(__dirname, "packages/utils/src"),
} as const

const turbopackAlias = {
  "@native/types": "./packages/types/src",
  "@native/ui": "./packages/ui/src",
  "@native/utils": "./packages/utils/src",
} as const

const nextConfig: NextConfig = {
  typedRoutes: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      ...webpackAlias,
    };
    return config;
  },
  turbopack: {
    resolveAlias: turbopackAlias,
  },
};

export default nextConfig;
