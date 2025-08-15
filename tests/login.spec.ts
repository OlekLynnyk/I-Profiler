import { test, expect } from '@playwright/test';

test('Landing page loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/H1NTED/i); // или любой ожидаемый заголовок
});
