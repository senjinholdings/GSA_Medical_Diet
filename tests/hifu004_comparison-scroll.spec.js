const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('hifu004_test comparison table horizontal scroll', () => {
  test('has horizontal overflow and drag scroll changes scrollLeft', async ({ page }) => {
    const filePath = 'file://' + path.resolve('hifu004_test/index.html');
    await page.goto(filePath);

    // wait DOM content
    await page.waitForSelector('.comparison-table');

    const table = page.locator('.comparison-table');

    // Ensure it overflows horizontally (scrollWidth > clientWidth)
    const { scrollWidth, clientWidth } = await table.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);

    // Record initial scrollLeft
    const startLeft = await table.evaluate((el) => el.scrollLeft);

    // Drag to the left by 200px
    const box = await table.boundingBox();
    await page.mouse.move(box.x + box.width - 40, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 240, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();

    // Check scrollLeft changed (greater than start)
    const endLeft = await table.evaluate((el) => el.scrollLeft);
    expect(endLeft).toBeGreaterThan(startLeft);

    // Sticky left column exists
    const stickyExists = await page.locator('.comparison-table th.sticky-col').count();
    expect(stickyExists).toBeGreaterThan(0);
  });
});

