import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    XAI_API_KEY: !!process.env.XAI_API_KEY,
    MY_AWS_REGION: !!process.env.MY_AWS_REGION,
    BUILD_CACHE_BUSTER: process.env.BUILD_CACHE_BUSTER ?? "missing",
  });
}
