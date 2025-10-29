const { test, expect } = require('@playwright/test');

test.describe('Medical Diet Detail Modal Test', () => {
  test('should open modal without opening new tab when clicking detail link', async ({ page, context }) => {
    // ページにアクセス
    await page.goto('http://localhost:49573/medical-diet003/');

    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');

    // 開いているページ数を記録
    const pagesBefore = context.pages().length;
    console.log('Pages before click:', pagesBefore);

    // 比較表の「詳細を見る」ボタンを探す
    const detailLink = page.locator('.detail-scroll-link').first();

    // 要素までスクロール
    await detailLink.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // リンクのhref属性とdata-rank属性を確認
    const href = await detailLink.getAttribute('href');
    const dataRank = await detailLink.getAttribute('data-rank');
    const hasListener = await detailLink.getAttribute('data-listener-attached');
    console.log('Detail link href:', href);
    console.log('Detail link data-rank:', dataRank);
    console.log('Detail link has listener:', hasListener);

    // クリックイベントをインターセプト
    await page.evaluate(() => {
      window.newTabOpened = false;
      const originalOpen = window.open;
      window.open = function(...args) {
        console.log('window.open called with:', args);
        window.newTabOpened = true;
        return originalOpen.apply(this, args);
      };
    });

    // 「詳細を見る」をクリック
    await detailLink.click();

    // 少し待機
    await page.waitForTimeout(1000);

    // 開いているページ数を確認（新しいタブが開かれていないこと）
    const pagesAfter = context.pages().length;
    console.log('Pages after click:', pagesAfter);
    expect(pagesAfter).toBe(pagesBefore);

    // モーダルが表示されることを確認
    const modal = page.locator('.clinic-detail-modal');
    await expect(modal).toBeVisible();

    // モーダルがactiveクラスを持つことを確認
    await expect(modal).toHaveClass(/active/);

    // オーバーレイが表示されることを確認
    const overlay = page.locator('.clinic-detail-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveClass(/active/);

    // bodyにno-scrollクラスが追加されることを確認
    const body = page.locator('body');
    await expect(body).toHaveClass(/no-scroll/);

    // モーダル内にクリニック詳細が表示されることを確認
    const modalBody = page.locator('.clinic-detail-body');
    await expect(modalBody).toBeVisible();

    // モーダルのヘッダーにクリニック名が表示されることを確認
    const modalHeader = modal.locator('header');
    await expect(modalHeader).toContainText('の詳細');

    console.log('✅ Modal opened successfully without opening new tab');

    // モーダルを閉じる
    const closeButton = page.locator('.clinic-detail-close');
    await closeButton.click();

    await page.waitForTimeout(500);

    // モーダルが閉じられたことを確認
    await expect(modal).not.toBeAttached();
  });

  test('should not navigate when clicking detail link', async ({ page }) => {
    await page.goto('http://localhost:49573/medical-diet003/');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log('Current URL before click:', currentUrl);

    // 「詳細を見る」をクリック
    const detailLink = page.locator('.detail-scroll-link').first();
    await detailLink.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await detailLink.click({ force: true });

    await page.waitForTimeout(1000);

    // URLのパス部分が変わっていないことを確認（クエリパラメータは無視）
    const newUrl = page.url();
    console.log('Current URL after click:', newUrl);

    const currentPath = new URL(currentUrl).pathname;
    const newPath = new URL(newUrl).pathname;
    expect(newPath).toBe(currentPath);

    console.log('✅ URL path did not change after clicking detail link');
  });
});
