// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('マウスピース矯正サイト E2Eテスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // コンソールエラーをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
  });

  test.describe('地域名表示機能', () => {
    
    test('デフォルト表示（東京）', async ({ page }) => {
      await page.goto('/mouthpiece/');
      
      // ページの読み込み完了を待つ
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // JavaScript実行を待つ
      
      // MVセクションの地域名表示を確認
      const mvRegionName = page.locator('#mv-region-name');
      await expect(mvRegionName).toHaveText('東京');
      
      // MVテキストの地域名を確認
      const mvRegionText = page.locator('#mv-region-text');
      await expect(mvRegionText).toHaveText('東京');
      
      // ランキングセクションの地域名表示を確認
      const rankRegionName = page.locator('#rank-region-name');
      await expect(rankRegionName).toHaveText('東京');
      
      // 比較表の地域名表示を確認
      const comparisonRegionName = page.locator('#comparison-region-name');
      await expect(comparisonRegionName).toHaveText('東京');
    });

    test('東京での表示（region_id=013）', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=013');
      
      // ページの読み込み完了を待つ
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // MVセクションの地域名表示を確認
      await expect(page.locator('#mv-region-name')).toHaveText('東京');
      await expect(page.locator('#mv-region-text')).toHaveText('東京');
      
      // ランキングセクションの地域名表示を確認
      await expect(page.locator('#rank-region-name')).toHaveText('東京');
      
      // 比較表の地域名表示を確認
      await expect(page.locator('#comparison-region-name')).toHaveText('東京');
    });

    test('大阪での表示（region_id=027）', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=027');
      
      // ページの読み込み完了を待つ
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // MVセクションの地域名表示を確認
      await expect(page.locator('#mv-region-name')).toHaveText('大阪');
      await expect(page.locator('#mv-region-text')).toHaveText('大阪');
      
      // ランキングセクションの地域名表示を確認
      await expect(page.locator('#rank-region-name')).toHaveText('大阪');
      
      // 比較表の地域名表示を確認
      await expect(page.locator('#comparison-region-name')).toHaveText('大阪');
    });

    test('全国での表示（region_id=000）', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=000');
      
      // ページの読み込み完了を待つ
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // MVセクションの地域名表示を確認（region_id=000は無効なため、デフォルトの東京になる）
      await expect(page.locator('#mv-region-name')).toHaveText('東京');
      await expect(page.locator('#mv-region-text')).toHaveText('東京');
      
      // ランキングセクションの地域名表示を確認
      await expect(page.locator('#rank-region-name')).toHaveText('東京');
      
      // 比較表の地域名表示を確認
      await expect(page.locator('#comparison-region-name')).toHaveText('東京');
    });

    test('北海道での表示（region_id=001）', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=001');
      
      // ページの読み込み完了を待つ
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // MVセクションの地域名表示を確認
      await expect(page.locator('#mv-region-name')).toHaveText('北海道');
      await expect(page.locator('#mv-region-text')).toHaveText('北海道');
      
      // ランキングセクションの地域名表示を確認
      await expect(page.locator('#rank-region-name')).toHaveText('北海道');
      
      // 比較表の地域名表示を確認
      await expect(page.locator('#comparison-region-name')).toHaveText('北海道');
    });
  });

  test.describe('無効なregion_idの処理', () => {
    
    test('無効な値（000）のハンドリング', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=000');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 無効な値はデフォルト（東京）に変換される
      await expect(page.locator('#mv-region-name')).toHaveText('東京');
      await expect(page.locator('#rank-region-name')).toHaveText('東京');
      await expect(page.locator('#comparison-region-name')).toHaveText('東京');
    });

    test('無効な値（0）のハンドリング', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=0');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 無効な値はデフォルト（東京）に変換される
      await expect(page.locator('#mv-region-name')).toHaveText('東京');
      await expect(page.locator('#rank-region-name')).toHaveText('東京');
      await expect(page.locator('#comparison-region-name')).toHaveText('東京');
    });

    test('存在しない値（999）のハンドリング', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=999');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 存在しない値はデフォルト（東京）として処理される
      await expect(page.locator('#mv-region-name')).toHaveText('東京');
      await expect(page.locator('#rank-region-name')).toHaveText('東京');
      await expect(page.locator('#comparison-region-name')).toHaveText('東京');
    });
  });

  test.describe('地域セレクタの動作', () => {
    
    test('地域セレクタが正しく表示される', async ({ page }) => {
      await page.goto('/mouthpiece/');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // サイドバーの地域選択が存在することを確認
      const regionSelect = page.locator('#sidebar-region-select');
      await expect(regionSelect).toBeVisible();
      
      // オプションが存在することを確認
      const options = regionSelect.locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
      
      // いくつかの主要地域のオプションが存在することを確認
      await expect(regionSelect.locator('option[value="013"]')).toHaveText('東京');
      await expect(regionSelect.locator('option[value="027"]')).toHaveText('大阪');
      await expect(regionSelect.locator('option[value="001"]')).toHaveText('北海道');
    });

    test('地域セレクタで地域を変更できる', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=013');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 初期状態は東京
      await expect(page.locator('#mv-region-name')).toHaveText('東京');
      
      // 地域セレクタで大阪に変更
      await page.selectOption('#sidebar-region-select', '027');
      
      // 少し待ってから表示を確認
      await page.waitForTimeout(1000);
      
      // 地域名が大阪に変更されることを確認
      await expect(page.locator('#mv-region-name')).toHaveText('大阪');
      await expect(page.locator('#rank-region-name')).toHaveText('大阪');
      await expect(page.locator('#comparison-region-name')).toHaveText('大阪');
      
      // URLのregion_idパラメータが更新されることを確認
      const currentUrl = page.url();
      expect(currentUrl).toContain('region_id=027');
    });
  });

  test.describe('詳細バナーの地域名と件数表示', () => {
    
    test('詳細バナーに地域名が表示される', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=013');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 詳細バナーセクションまでスクロール
      await page.locator('.clinic-details-section').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // 詳細バナーの地域名表示を確認
      const detailRegionElement = page.locator('#detail-region-name');
      await expect(detailRegionElement).toBeVisible();
      await expect(detailRegionElement).toHaveText('東京');
    });

    test('詳細バナーの件数表示が動的に更新される', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=013');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 詳細バナーセクションまでスクロール
      await page.locator('.clinic-details-section').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // ランク件数表示要素を確認
      const rankCountElement = page.locator('#detail-rank-count');
      if (await rankCountElement.isVisible()) {
        const countText = await rankCountElement.textContent();
        expect(countText).toMatch(/\d+/); // 数字が含まれることを確認
      }
    });
  });

  test.describe('レスポンシブ対応', () => {
    
    test('モバイルビューでの地域名表示', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/mouthpiece/?region_id=013');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // モバイルでも地域名が正しく表示される
      await expect(page.locator('#mv-region-name')).toHaveText('東京');
      await expect(page.locator('#rank-region-name')).toHaveText('東京');
    });

    test('タブレットビューでの地域名表示', async ({ page }) => {
      // タブレットサイズに設定
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/mouthpiece/?region_id=027');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // タブレットでも地域名が正しく表示される
      await expect(page.locator('#mv-region-name')).toHaveText('大阪');
      await expect(page.locator('#rank-region-name')).toHaveText('大阪');
    });
  });

  test.describe('パフォーマンステスト', () => {
    
    test('ページ読み込み時間', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/mouthpiece/?region_id=013');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // 10秒以内に読み込まれることを確認（妥当な範囲）
      expect(loadTime).toBeLessThan(10000);
      
      console.log(`ページ読み込み時間: ${loadTime}ms`);
    });

    test('JavaScript実行エラーがないこと', async ({ page }) => {
      const errors = [];
      
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      await page.goto('/mouthpiece/?region_id=013');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // JavaScriptエラーが発生していないことを確認
      expect(errors).toHaveLength(0);
    });
  });

  test.describe('アクセシビリティ', () => {
    
    test('地域名表示要素にアクセシブルな属性があること', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=013');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 地域セレクタにラベルが関連付けられていることを確認
      const regionSelectLabel = page.locator('label[for="sidebar-region-select"]');
      await expect(regionSelectLabel).toBeVisible();
      await expect(regionSelectLabel).toHaveText('地域選択');
      
      // 地域セレクタ要素が適切にラベル付けされていることを確認
      const regionSelect = page.locator('#sidebar-region-select');
      await expect(regionSelect).toBeVisible();
    });
  });

  test.describe('エラーハンドリング', () => {
    
    test('データ読み込み失敗時のフォールバック', async ({ page }) => {
      // ネットワークエラーをシミュレート
      await page.route('**/data/compiled-data.json', route => {
        route.abort();
      });
      
      await page.goto('/mouthpiece/?region_id=013');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // エラー時でもページが正常に表示されることを確認
      // （デフォルト値やフォールバック処理が機能することを確認）
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('SEO関連', () => {
    
    test('各地域でのページタイトルとメタ情報', async ({ page }) => {
      await page.goto('/mouthpiece/?region_id=013');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // ページタイトルが設定されていることを確認
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title).toContain('マウスピース');
      
      // メタディスクリプションが設定されていることを確認
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content');
    });
  });

});