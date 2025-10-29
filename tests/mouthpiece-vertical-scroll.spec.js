const { test, expect, devices } = require('@playwright/test');

test.describe('Mouthpiece Reference Site Vertical Scroll Test', () => {
  test('check vertical scrolling capability in mouthpiece site', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      viewport: { width: 390, height: 844 }
    });

    const page = await context.newPage();

    // ローカルサーバーを想定（実際のポート番号は環境に合わせて調整）
    await page.goto('http://localhost:49573/../../マウスピース/GSA_Mouthpiece/mouthpiece_section001/');
    await page.waitForLoadState('networkidle');

    // 比較表セクションまでスクロール
    const comparisonSection = page.locator('.comparison-section');
    await comparisonSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 比較表のラッパー要素を取得
    const tableWrapper = page.locator('.comparison-table-wrapper').first();

    // 要素が存在することを確認
    const isVisible = await tableWrapper.isVisible().catch(() => false);
    console.log('Table wrapper visible:', isVisible);

    if (isVisible) {
      // スクロール可能かどうかを確認
      const scrollInfo = await tableWrapper.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          overflowY: computed.overflowY,
          overflowX: computed.overflowX,
          maxHeight: computed.maxHeight,
          height: computed.height
        };
      });

      console.log('Mouthpiece site scroll info:', scrollInfo);
      console.log('Can scroll vertically:', scrollInfo.scrollHeight > scrollInfo.clientHeight);
      console.log('Can scroll horizontally:', scrollInfo.scrollWidth > scrollInfo.clientWidth);
    }

    await context.close();
  });
});
