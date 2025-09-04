const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('HIFU004 比較表スワイプ機能テスト', () => {
  const filePath = `file://${path.resolve(__dirname, '../hifu004_test/index.html')}`;
  
  test.beforeEach(async ({ page }) => {
    await page.goto(filePath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // データ読み込み待機（増やした）
    
    // 比較表が生成されるまで待つ
    await page.waitForSelector('.comparison-table tbody tr', { timeout: 10000 });
  });

  test('モバイルビュー: 3クリニック表示とスワイプ機能', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    
    // 比較表が存在することを確認
    const comparisonTable = page.locator('.comparison-table');
    await expect(comparisonTable).toBeVisible();
    
    // 比較表がスクロール可能であることを確認
    const tableElement = await comparisonTable.elementHandle();
    const scrollable = await page.evaluate(el => {
      return el.scrollWidth > el.clientWidth;
    }, tableElement);
    expect(scrollable).toBeTruthy();
    
    // 項目列（最初の列）が固定されていることを確認
    const stickyCol = page.locator('.sticky-col').first();
    const stickyStyle = await stickyCol.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        left: style.left
      };
    });
    expect(stickyStyle.position).toBe('sticky');
    expect(stickyStyle.left).toBe('0px');
    
    // クリニック列の幅を確認（3つ分がビューポート内に収まる）
    const clinicCols = page.locator('.clinic-col');
    const clinicCount = await clinicCols.count();
    console.log(`クリニック数: ${clinicCount}`);
    
    if (clinicCount > 0) {
      const firstClinicCol = clinicCols.first();
      const colWidth = await firstClinicCol.evaluate(el => el.offsetWidth);
      console.log(`クリニック列の幅: ${colWidth}px`);
      
      // 3列分の幅がビューポート幅以内であることを確認
      const viewportWidth = 375;
      const itemColWidth = 100; // 項目列の幅
      const expectedColWidth = (viewportWidth - itemColWidth - 40) / 3;
      expect(colWidth).toBeCloseTo(expectedColWidth, -1);
    }
    
    // スワイプインジケーターが表示されていることを確認
    const indicator = page.locator('.swipe-indicator');
    await expect(indicator).toBeVisible();
    
    // インジケータードットの数を確認
    const dots = page.locator('.indicator-dot');
    const dotCount = await dots.count();
    const expectedDotCount = Math.ceil(clinicCount / 3);
    expect(dotCount).toBe(expectedDotCount);
    
    // 最初のドットがアクティブであることを確認
    const firstDot = dots.first();
    const firstDotColor = await firstDot.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(firstDotColor).toContain('107, 209, 208'); // #6bd1d0
    
    // スワイプ動作をシミュレート
    await comparisonTable.scrollIntoViewIfNeeded();
    const box = await comparisonTable.boundingBox();
    if (box) {
      // 右から左へスワイプ
      await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);
      
      // スクロール位置が変更されたことを確認
      const scrollLeft = await comparisonTable.evaluate(el => el.scrollLeft);
      expect(scrollLeft).toBeGreaterThan(0);
      
      // 2番目のドットがアクティブになっていることを確認（ページ数が2以上の場合）
      if (dotCount > 1) {
        const secondDot = dots.nth(1);
        const secondDotColor = await secondDot.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        expect(secondDotColor).toContain('107, 209, 208');
      }
    }
  });

  test('デスクトップビュー: 5クリニック全表示', async ({ page }) => {
    // デスクトップビューポートに設定
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // 比較表が存在することを確認
    const comparisonTable = page.locator('.comparison-table');
    await expect(comparisonTable).toBeVisible();
    
    // スクロールが無効であることを確認
    const tableElement = await comparisonTable.elementHandle();
    const overflowX = await page.evaluate(el => {
      return window.getComputedStyle(el).overflowX;
    }, tableElement);
    expect(overflowX).toBe('visible');
    
    // すべてのクリニック列が表示されていることを確認
    const clinicCols = page.locator('.clinic-col');
    const visibleCount = await clinicCols.evaluateAll(cols => 
      cols.filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && !el.classList.contains('col-hidden');
      }).length
    );
    const totalCount = await clinicCols.count();
    expect(visibleCount).toBe(totalCount);
    
    // スワイプインジケーターが表示されていないことを確認
    const indicator = page.locator('.swipe-indicator');
    await expect(indicator).not.toBeVisible();
    
    // 固定列設定が解除されていることを確認
    const firstCol = page.locator('th').first();
    const colStyle = await firstCol.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        left: style.left
      };
    });
    expect(colStyle.position).not.toBe('sticky');
  });

  test('レスポンシブ切り替え: リサイズ時の動作', async ({ page }) => {
    // デスクトップから開始
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // デスクトップ表示を確認
    let comparisonTable = page.locator('.comparison-table');
    let overflowX = await comparisonTable.evaluate(el => 
      window.getComputedStyle(el).overflowX
    );
    expect(overflowX).toBe('visible');
    
    // モバイルにリサイズ
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500); // リサイズハンドラーの実行を待つ
    
    // モバイル表示を確認
    overflowX = await comparisonTable.evaluate(el => 
      window.getComputedStyle(el).overflowX
    );
    expect(['auto', 'scroll']).toContain(overflowX);
    
    // スワイプインジケーターが表示されることを確認
    const indicator = page.locator('.swipe-indicator');
    await expect(indicator).toBeVisible();
    
    // デスクトップに戻す
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // デスクトップ表示に戻ることを確認
    overflowX = await comparisonTable.evaluate(el => 
      window.getComputedStyle(el).overflowX
    );
    expect(overflowX).toBe('visible');
    
    // インジケーターが非表示になることを確認
    await expect(indicator).not.toBeVisible();
  });

  test('インジケータークリック: ページ移動', async ({ page }) => {
    // モバイルビューポート
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    
    const dots = page.locator('.indicator-dot');
    const dotCount = await dots.count();
    
    if (dotCount > 1) {
      // 2番目のドットをクリック
      const secondDot = dots.nth(1);
      await secondDot.click();
      await page.waitForTimeout(500);
      
      // スクロール位置が変更されたことを確認
      const comparisonTable = page.locator('.comparison-table');
      const scrollLeft = await comparisonTable.evaluate(el => el.scrollLeft);
      expect(scrollLeft).toBeGreaterThan(0);
      
      // 2番目のドットがアクティブになっていることを確認
      const secondDotColor = await secondDot.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(secondDotColor).toContain('107, 209, 208');
      
      // 最初のドットをクリックして戻る
      const firstDot = dots.first();
      await firstDot.click();
      await page.waitForTimeout(500);
      
      // スクロール位置が最初に戻ることを確認
      const newScrollLeft = await comparisonTable.evaluate(el => el.scrollLeft);
      expect(newScrollLeft).toBeLessThanOrEqual(10); // 完全に0にならない場合もあるため
    }
  });

  test('スクロールスナップ: 3クリニックごとにスナップ', async ({ page }) => {
    // モバイルビューポート
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    
    const comparisonTable = page.locator('.comparison-table');
    const clinicCols = page.locator('.clinic-col');
    const clinicCount = await clinicCols.count();
    
    if (clinicCount > 3) {
      // 少しだけスクロール
      await comparisonTable.evaluate(el => {
        el.scrollLeft = 50;
      });
      await page.waitForTimeout(500);
      
      // スナップによって位置が調整されることを確認
      const scrollLeft = await comparisonTable.evaluate(el => el.scrollLeft);
      const colWidth = await clinicCols.first().evaluate(el => el.offsetWidth);
      
      // スクロール位置が3列分の倍数に近いことを確認
      const expectedPositions = [];
      for (let i = 0; i < Math.ceil(clinicCount / 3); i++) {
        expectedPositions.push(i * 3 * colWidth);
      }
      
      const closestPosition = expectedPositions.reduce((prev, curr) => 
        Math.abs(curr - scrollLeft) < Math.abs(prev - scrollLeft) ? curr : prev
      );
      
      expect(Math.abs(scrollLeft - closestPosition)).toBeLessThan(50);
    }
  });
});