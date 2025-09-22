import { test, expect } from '@playwright/test';

test('unauthenticated user is redirected from protected paths to /login', async ({ page }) => {
  const resp = await page.goto('/workspace');
  // Next will issue 307/308 or render the login page; проверим итоговый URL
  expect(resp?.status()).toBeGreaterThan(0);
  await page.waitForLoadState('domcontentloaded');
  expect(new URL(page.url()).pathname).toBe('/login');
  const params = new URL(page.url()).searchParams;
  expect(params.get('redirect')).toBe('/workspace');
});
