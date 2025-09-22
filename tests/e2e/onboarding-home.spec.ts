import { test, expect } from '@playwright/test';

test.describe('Home Onboarding', () => {
  test('desktop: shows once for new user and then never', async ({ page, context }) => {
    await context.addCookies([
      { name: 'viewport', value: 'desktop', url: 'http://localhost:3000' },
    ]);

    // имитация авторизованного пользователя (если есть test helper — используй его)
    // здесь: просто заходим как будто уже после логина
    await page.goto('/');

    // ждём Header
    await page.getByRole('button', { name: /login|logout/i }).waitFor();

    // если впервые — должен появиться спотлайт
    const spotlight = page.locator('div[role="dialog"]');
    await expect(spotlight).toBeVisible();

    // нажимаем "Open Workspace"
    await page.getByRole('button', { name: /open workspace/i }).click();
    await expect(page).toHaveURL(/\/workspace/);

    // возвращаемся на главную
    await page.goto('/');
    await expect(spotlight).toHaveCount(0);
  });

  test('mobile: shows once independently from desktop', async ({ page, context }) => {
    // эмулируем мобильный UA и размер
    await context.newCDPSession(page);
    await page.emulateMedia({ reducedMotion: 'reduce' }); // чтобы анимации не мешали
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');

    const spotlight = page.locator('div[role="dialog"]');
    await expect(spotlight).toBeVisible();

    // закрываем "Later"
    await page.getByRole('button', { name: /later|got it/i }).click();
    await expect(spotlight).toHaveCount(0);

    // повторный визит — не должен появиться
    await page.reload();
    await expect(spotlight).toHaveCount(0);
  });
});
