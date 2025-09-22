import { test, expect } from '@playwright/test';

test('CSP Report-Only header is present on landing', async ({ request }) => {
  const res = await request.get('/');
  expect(res.status()).toBeLessThan(400);
  const cspRo = res.headers()['content-security-policy-report-only'];
  expect(cspRo, 'CSP-RO header should exist').toBeTruthy();
});
