import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  runtime: "nodejs",
  output: "standalone",
  env: {
    // Supabase
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

    // AWS Bedrock
    MY_AWS_ACCESS_KEY_ID: process.env.MY_AWS_ACCESS_KEY_ID,
    MY_AWS_SECRET_ACCESS_KEY: process.env.MY_AWS_SECRET_ACCESS_KEY,
    MY_AWS_REGION: process.env.MY_AWS_REGION,

    // xAI Grok-3
    XAI_API_KEY: process.env.XAI_API_KEY,

    // Email mock
    USE_EMAIL_MOCK: process.env.USE_EMAIL_MOCK,
  },
};

export default nextConfig;
