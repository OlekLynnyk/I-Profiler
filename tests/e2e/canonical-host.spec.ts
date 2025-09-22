import { test, expect } from '@playwright/test';

const HOST = process.env.E2E_HOST;

// если переменная не задана — пропускаем весь файл
test.skip(!HOST, 'E2E_HOST is not set; skipping canonical-host test');

test('www host is redirected to apex with 308', async ({ request }) => {
  const host = HOST as string; // после skip выше — точно строка
  const res = await request.get(`${host}/`, {
    headers: { host: 'www.h1nted.com' },
  });

  expect(res.status(), 'should be 308 Permanent Redirect').toBe(308);

  const loc = res.headers()['location'];
  expect(loc).toBeTruthy();

  const apex = new URL(host);
  expect(new URL(loc as string, apex).host).toBe(apex.host);
});
