import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Удаляем serverActions — он необязателен
  runtime: "nodejs",
  output: "standalone",
};

export default nextConfig;
