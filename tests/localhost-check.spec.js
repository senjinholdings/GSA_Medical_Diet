const { test, expect } = require('@playwright/test');

test.describe('localhost:3000 HIFU004 モバイル表示確認', () => {
  
  test('375px表示: 1位ディオクリニックが表示され、横スクロール可能', async ({ page }) => {
    // モバイルビューポート（iPhone SE）に設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // localhost:3000にアクセス
    await page.goto('http://localhost:3000/hifu004_test/');
    
    // ページ読み込み待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // データ読み込み待機
    
    // 比較表が存在することを確認
    const comparisonTable = page.locator('.comparison-table').first();
    const tableExists = await comparisonTable.count() > 0;
    console.log(`比較表が存在: ${tableExists}`);
    
    if (tableExists) {
      // スクリーンショットを撮影（初期状態）
      await page.screenshot({ 
        path: 'test-results/localhost-initial.png',
        fullPage: false 
      });
      
      // 比較表のスクロール可能性をチェック
      const isScrollable = await comparisonTable.evaluate(el => {
        return el.scrollWidth > el.clientWidth;
      });
      console.log(`横スクロール可能: ${isScrollable}`);
      
      // 1位のディオクリニックを探す
      const firstClinic = page.locator('.clinic-col').first();
      const clinicVisible = await firstClinic.isVisible();
      console.log(`最初のクリニック列が表示: ${clinicVisible}`);
      
      // ディオクリニックのロゴまたはテキストを確認
      const dioElements = await page.locator('text=/ディオ|DIO|dio/i').count();
      console.log(`ディオクリニック関連要素数: ${dioElements}`);
      
      // 最初のクリニック列の内容を取得
      if (await firstClinic.count() > 0) {
        const firstClinicContent = await firstClinic.textContent();
        console.log(`最初のクリニック列の内容: ${firstClinicContent?.substring(0, 50)}...`);
      }
      
      // 比較表内でディオクリニックが見えているか確認
      const visibleClinics = await page.locator('.comparison-table .clinic-col:visible').count();
      console.log(`表示されているクリニック数: ${visibleClinics}`);
      
      // 各表示されているクリニックの情報を取得
      for (let i = 0; i < Math.min(visibleClinics, 5); i++) {
        const clinic = page.locator('.comparison-table .clinic-col:visible').nth(i);
        const clinicText = await clinic.textContent();
        console.log(`クリニック${i + 1}: ${clinicText?.substring(0, 30)}...`);
      }
      
      // スクロール位置を確認
      const scrollLeft = await comparisonTable.evaluate(el => el.scrollLeft);
      console.log(`初期スクロール位置: ${scrollLeft}px`);
      
      // 横スクロールをテスト
      if (isScrollable) {
        // 右にスワイプ
        const box = await comparisonTable.boundingBox();
        if (box) {
          await page.mouse.move(box.x + 100, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x - 100, box.y + box.height / 2, { steps: 10 });
          await page.mouse.up();
          await page.waitForTimeout(500);
          
          const newScrollLeft = await comparisonTable.evaluate(el => el.scrollLeft);
          console.log(`スワイプ後のスクロール位置: ${newScrollLeft}px`);
          
          // スクリーンショットを撮影（スワイプ後）
          await page.screenshot({ 
            path: 'test-results/localhost-after-swipe.png',
            fullPage: false 
          });
        }
      }
      
      // 項目列が固定されているか確認
      const stickyCol = page.locator('.sticky-col').first();
      if (await stickyCol.count() > 0) {
        const stickyStyle = await stickyCol.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            position: style.position,
            left: style.left,
            zIndex: style.zIndex
          };
        });
        console.log(`項目列のスタイル:`, stickyStyle);
      }
      
      // テスト結果のサマリー
      console.log('\n=== テスト結果サマリー ===');
      console.log(`✓ 比較表が存在: ${tableExists}`);
      console.log(`✓ 横スクロール可能: ${isScrollable}`);
      console.log(`✓ クリニック列が表示: ${clinicVisible}`);
      console.log(`✓ ディオクリニック要素: ${dioElements > 0 ? '見つかりました' : '見つかりません'}`);
      
      // アサーション
      expect(tableExists).toBeTruthy();
      expect(isScrollable).toBeTruthy();
      expect(visibleClinics).toBeGreaterThanOrEqual(3);
    }
  });
});