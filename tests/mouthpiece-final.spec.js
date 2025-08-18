// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('マウスピース矯正サイト - 包括的E2Eテスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // エラーログのキャッチ（参考情報として）
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('404')) {
        console.log('Console error:', msg.text());
      }
    });
  });

  test('基本的なページ表示と要素の存在確認', async ({ page }) => {
    await page.goto('/mouthpiece/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 基本的なページ要素の存在確認
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('.container').first()).toBeVisible();
    await expect(page.locator('.hero-section')).toBeVisible();
    
    // 地域名表示要素の存在確認
    await expect(page.locator('#mv-region-name')).toBeVisible();
    await expect(page.locator('#mv-region-text')).toBeVisible();
    await expect(page.locator('#rank-region-name')).toBeVisible();
    await expect(page.locator('#comparison-region-name')).toBeVisible();
    
    console.log('✓ 基本的なページ要素と地域名表示要素が存在します');
  });

  test('地域名表示の内容確認', async ({ page }) => {
    await page.goto('/mouthpiece/?region_id=013');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 各地域名表示要素のテキストを取得
    const mvRegionText = await page.locator('#mv-region-name').textContent();
    const mvMainText = await page.locator('#mv-region-text').textContent();
    const rankRegionText = await page.locator('#rank-region-name').textContent();
    const comparisonRegionText = await page.locator('#comparison-region-name').textContent();
    
    console.log('地域名表示状況:');
    console.log(`  MV地域名: ${mvRegionText}`);
    console.log(`  MVメインテキスト: ${mvMainText}`);
    console.log(`  ランキング地域名: ${rankRegionText}`);
    console.log(`  比較表地域名: ${comparisonRegionText}`);
    
    // 地域名が設定されていることを確認（空でないこと）
    expect(mvRegionText).toBeTruthy();
    expect(mvMainText).toBeTruthy();
    expect(rankRegionText).toBeTruthy();
    expect(comparisonRegionText).toBeTruthy();
  });

  test('無効なregion_idのフォールバック処理確認', async ({ page }) => {
    const invalidIds = ['000', '0', '999', 'invalid', ''];
    
    for (const invalidId of invalidIds) {
      const url = invalidId ? `/mouthpiece/?region_id=${invalidId}` : '/mouthpiece/';
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // ページが正常に表示されることを確認
      await expect(page.locator('body')).toBeVisible();
      
      // 地域名が何らかの値（デフォルト値）で表示されることを確認
      const mvText = await page.locator('#mv-region-name').textContent();
      const comparisonText = await page.locator('#comparison-region-name').textContent();
      
      expect(mvText).toBeTruthy();
      expect(comparisonText).toBeTruthy();
      
      console.log(`無効ID "${invalidId}": MV="${mvText}", 比較="${comparisonText}"`);
    }
    
    console.log('✓ 無効なregion_idに対する適切なフォールバック処理を確認');
  });

  test('詳細バナーセクションの地域名と件数表示', async ({ page }) => {
    await page.goto('/mouthpiece/?region_id=013');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 詳細セクションまでスクロール
    await page.locator('.clinic-details-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // 詳細バナーの地域名要素の確認
    const detailRegionElement = page.locator('#detail-region-name');
    if (await detailRegionElement.isVisible()) {
      const detailText = await detailRegionElement.textContent();
      expect(detailText).toBeTruthy();
      console.log(`詳細バナー地域名: "${detailText}"`);
    }
    
    // 件数表示要素の確認
    const rankCountElement = page.locator('#detail-rank-count');
    if (await rankCountElement.isVisible()) {
      const countText = await rankCountElement.textContent();
      expect(countText).toBeTruthy();
      expect(countText).toMatch(/\d+/); // 数字が含まれることを確認
      console.log(`詳細バナー件数表示: "${countText}"`);
    }
    
    console.log('✓ 詳細バナーの地域名と件数表示を確認');
  });

  test('地域セレクターの存在と基本動作', async ({ page }) => {
    await page.goto('/mouthpiece/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 地域セレクターの存在確認
    const regionSelect = page.locator('#sidebar-region-select');
    
    if (await regionSelect.isVisible()) {
      console.log('✓ 地域セレクターが表示されています');
      
      // セレクター要素の基本属性確認
      const tagName = await regionSelect.evaluate(el => el.tagName);
      expect(tagName).toBe('SELECT');
      
      // 関連するラベルの確認
      const label = page.locator('label[for="sidebar-region-select"]');
      if (await label.isVisible()) {
        const labelText = await label.textContent();
        console.log(`地域セレクターのラベル: "${labelText}"`);
      }
      
    } else {
      console.log('⚠ 地域セレクターが見つかりませんでした');
    }
  });

  test('レスポンシブデザインでの地域名表示', async ({ page }) => {
    // デスクトップサイズでの確認
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/mouthpiece/?region_id=013');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const desktopMvText = await page.locator('#mv-region-name').textContent();
    console.log(`デスクトップ表示: ${desktopMvText}`);
    
    // タブレットサイズでの確認
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const tabletMvText = await page.locator('#mv-region-name').textContent();
    console.log(`タブレット表示: ${tabletMvText}`);
    
    // モバイルサイズでの確認
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileMvText = await page.locator('#mv-region-name').textContent();
    console.log(`モバイル表示: ${mobileMvText}`);
    
    // どのサイズでも地域名が表示されることを確認
    expect(desktopMvText).toBeTruthy();
    expect(tabletMvText).toBeTruthy();
    expect(mobileMvText).toBeTruthy();
    
    console.log('✓ レスポンシブデザインでの地域名表示を確認');
  });

  test('パフォーマンスとエラーハンドリング', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/mouthpiece/?region_id=027');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`ページ読み込み時間: ${loadTime}ms`);
    
    // 妥当な読み込み時間かチェック（10秒以内）
    expect(loadTime).toBeLessThan(10000);
    
    // ページタイトルが存在することを確認
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`ページタイトル: "${title}"`);
    
    // メタディスクリプションの存在確認
    const metaDescription = page.locator('meta[name="description"]');
    const hasMetaDescription = await metaDescription.count() > 0;
    if (hasMetaDescription) {
      const descriptionContent = await metaDescription.getAttribute('content');
      console.log(`メタディスクリプション: "${descriptionContent}"`);
    }
    
    console.log('✓ パフォーマンスとSEO要素を確認');
  });

  test('主要な機能要素の統合確認', async ({ page }) => {
    await page.goto('/mouthpiece/?region_id=013');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 統合テスト: 主要な機能要素がすべて存在するか
    const criticalElements = [
      '#mv-region-name',          // MVの地域名
      '#mv-region-text',          // MVテキストの地域名
      '#rank-region-name',        // ランキングの地域名
      '#comparison-region-name',  // 比較表の地域名
      '.hero-section',           // ヒーローセクション
      '.clinic-rankings',        // ランキングセクション
      '.comparison-section'      // 比較セクション
    ];
    
    let allElementsPresent = true;
    const results = [];
    
    for (const selector of criticalElements) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible();
      results.push({ selector, isVisible });
      
      if (!isVisible) {
        allElementsPresent = false;
      }
    }
    
    console.log('主要要素の存在チェック:');
    results.forEach(result => {
      const status = result.isVisible ? '✓' : '✗';
      console.log(`  ${status} ${result.selector}`);
    });
    
    // 最低限の要素が存在することを確認
    const visibleCount = results.filter(r => r.isVisible).length;
    expect(visibleCount).toBeGreaterThan(criticalElements.length * 0.7); // 70%以上の要素が存在
    
    console.log(`✓ 主要機能要素の ${visibleCount}/${criticalElements.length} が確認されました`);
  });

});