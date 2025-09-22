import { test, expect } from '@playwright/test';

test('bypass paths (/api/stripe/*) are reachable and not redirected', async ({ request }) => {
  const res = await request.get('/api/stripe/_playwright_ping');
  // роут может не существовать → 404 ок; главное — НЕ редирект
  expect([200, 201, 204, 400, 401, 403, 404, 405]).toContain(res.status());
  const loc = res.headers()['location'];
  expect(loc, 'should not redirect').toBeFalsy();
});

test('bypass paths (/api/ai/*) are reachable and not redirected', async ({ request }) => {
  const res = await request.get('/api/ai/_playwright_ping');
  expect([200, 201, 204, 400, 401, 403, 404, 405]).toContain(res.status());
  const loc = res.headers()['location'];
  expect(loc, 'should not redirect').toBeFalsy();
});
