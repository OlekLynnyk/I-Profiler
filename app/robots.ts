import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/login', '/workspace', '/settings', '/api', '/auth'],
      },
    ],
    sitemap: `${(process.env.NEXT_PUBLIC_APP_URL ?? 'https://h1nted.com').replace(/\/+$/, '')}/sitemap.xml`,
  };
}
