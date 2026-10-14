import type { NextConfig } from "next";
const config: NextConfig = {
  ...(process.env.NEXT_PUBLIC_STATIC_DEMO === "true"
    ? {
        output: "export" as const,
        basePath: process.env.RECORD_BASE_PATH || "/MyJJYRepo",
        trailingSlash: true,
      }
    : {}),
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
};
export default config;
