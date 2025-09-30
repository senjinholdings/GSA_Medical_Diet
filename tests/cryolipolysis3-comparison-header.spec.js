const { test, expect } = require('@playwright/test');
const path = require('path');

const pageUrl = `file://${path.resolve(__dirname, '../cryolipolysis3/index.html')}`;

async function waitForComparisonHeader(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('.comparison-headline .comparison-title', { state: 'visible' });
}

test.describe('cryolipolysis3 comparison header', () => {
  test('desktop view screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(pageUrl);
    await waitForComparisonHeader(page);

    const header = page.locator('.comparison-header');
    await expect(header).toBeVisible();

    await header.screenshot({ path: path.resolve(__dirname, '../test-results/cryolipolysis3-comparison-header-desktop.png') });
  });

  test('mobile view screenshot', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' });
    const page = await context.newPage();

    await page.goto(pageUrl);
    await waitForComparisonHeader(page);

    const header = page.locator('.comparison-header');
    await expect(header).toBeVisible();

    await header.screenshot({ path: path.resolve(__dirname, '../test-results/cryolipolysis3-comparison-header-mobile.png') });

    await context.close();
  });
});
