import { test, expect } from '@playwright/test';

test('take screenshot of St Johnstone FC homepage', async ({ page }) => {
  await page.goto('https://perthstjohnstonefc.co.uk/');
  await page.screenshot({ path: 'st_johnstone_homepage.png', fullPage: true });
});
