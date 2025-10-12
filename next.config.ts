import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const ContentSecurityPolicy = `
  default-src 'self' https: data: blob:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https:;
  style-src 'self' 'unsafe-inline' https:;
  img-src * blob: data: https://h1nted-video.s3.eu-west-1.amazonaws.com;
  media-src 'self' https: blob: data: https://h1nted-video.s3.eu-west-1.amazonaws.com https://*.s3.eu-west-1.amazonaws.com;
  connect-src *;
  font-src 'self';
  frame-src https:;
  worker-src 'self' blob:;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: 'h1nted',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  disableLogger: true,
  automaticVercelMonitors: true,
});
