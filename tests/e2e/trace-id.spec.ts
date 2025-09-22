import { test, expect } from '@playwright/test';

test('x-trace-id is set for normal pages', async ({ request }) => {
  const res = await request.get('/');
  expect(res.status()).toBeLessThan(400);
  const traceId = res.headers()['x-trace-id'];
  expect(traceId, 'x-trace-id header should exist').toBeTruthy();
});
