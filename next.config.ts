import type { NextConfig } from 'next';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';

const envPath = '.env.production';
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`[next.config] Loaded environment from ${envPath}`);
} else {
  console.warn(`[next.config] Warning: ${envPath} not found — environment variables may be missing`);
}

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
