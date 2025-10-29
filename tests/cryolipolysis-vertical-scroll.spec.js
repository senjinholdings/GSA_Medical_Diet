const { test, expect, devices } = require('@playwright/test');

test.describe('Cryolipolysis Comparison Table Vertical Scroll Test', () => {
  test('should allow vertical scrolling in comparison table on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      viewport: { width: 390, height: 844 }
    });

    const page = await context.newPage();
    await page.goto('http://localhost:49573/cryolipolysis003/');
    await page.waitForLoadState('networkidle');

    // 比較表セクションまでスクロール
    const comparisonSection = page.locator('.comparison-section');
    await comparisonSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 比較表のラッパー要素を取得
    const tableWrapper = page.locator('.comparison-table-wrapper').first();

    // 要素が存在することを確認
    await expect(tableWrapper).toBeVisible();

    // overflow-y プロパティを確認
    const overflowY = await tableWrapper.evaluate((el) => {
      return window.getComputedStyle(el).overflowY;
    });
    console.log('overflow-y:', overflowY);

    // overflow-y が auto または scroll であることを確認
    expect(['auto', 'scroll']).toContain(overflowY);

    // スクロール可能かどうかを確認
    const scrollInfo = await tableWrapper.evaluate((el) => {
      return {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft
      };
    });

    console.log('Scroll info:', scrollInfo);
    console.log('Can scroll vertically:', scrollInfo.scrollHeight > scrollInfo.clientHeight);
    console.log('Can scroll horizontally:', scrollInfo.scrollWidth > scrollInfo.clientWidth);

    // 比較表の高さを確認
    const tableHeight = await tableWrapper.evaluate((el) => {
      const table = el.querySelector('#comparison-table');
      return table ? table.offsetHeight : 0;
    });
    console.log('Table height:', tableHeight);

    // 縦スクロールを試みる
    if (scrollInfo.scrollHeight > scrollInfo.clientHeight) {
      // 下にスクロール
      await tableWrapper.evaluate((el) => {
        el.scrollTop = 100;
      });

      await page.waitForTimeout(500);

      // スクロール位置を確認
      const newScrollTop = await tableWrapper.evaluate((el) => el.scrollTop);
      console.log('New scrollTop after scroll:', newScrollTop);

      expect(newScrollTop).toBeGreaterThan(0);
      console.log('✅ Vertical scrolling is working');
    } else {
      console.log('⚠️ Table is not tall enough to scroll vertically');
      console.log('scrollHeight:', scrollInfo.scrollHeight);
      console.log('clientHeight:', scrollInfo.clientHeight);
    }

    // 横スクロールも確認
    if (scrollInfo.scrollWidth > scrollInfo.clientWidth) {
      await tableWrapper.evaluate((el) => {
        el.scrollLeft = 100;
      });

      await page.waitForTimeout(500);

      const newScrollLeft = await tableWrapper.evaluate((el) => el.scrollLeft);
      console.log('New scrollLeft after scroll:', newScrollLeft);

      expect(newScrollLeft).toBeGreaterThan(0);
      console.log('✅ Horizontal scrolling is working');
    }

    // スクリーンショットを撮影
    await page.screenshot({
      path: 'test-results/cryolipolysis-table-mobile-scroll.png',
      fullPage: false
    });

    await context.close();
  });
});
