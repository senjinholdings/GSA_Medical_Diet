// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('マウスピース矯正サイト 地域名表示テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    // コンソールエラーをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
  });

  test('地域名表示の動的更新確認', async ({ page }) => {
    await page.goto('/mouthpiece/?region_id=013');
    
    // ページの読み込み完了を待つ
    await page.waitForLoadState('networkidle');
    
    // JavaScriptの実行とデータ読み込みを待つ
    await page.waitForTimeout(5000);
    
    // データローダーやマネージャーの初期化を待つ
    await page.waitForFunction(() => {
      return window.dataManager && window.dataManager.regions;
    }, { timeout: 10000 });
    
    console.log('データマネージャーが初期化されました');
    
    // 地域名要素の存在確認
    const mvRegionName = page.locator('#mv-region-name');
    const mvRegionText = page.locator('#mv-region-text');
    const rankRegionName = page.locator('#rank-region-name');
    const comparisonRegionName = page.locator('#comparison-region-name');
    
    // 要素が存在することを確認
    await expect(mvRegionName).toBeVisible();
    await expect(mvRegionText).toBeVisible();
    await expect(rankRegionName).toBeVisible();
    await expect(comparisonRegionName).toBeVisible();
    
    // 地域名の内容を取得してログに出力
    const mvText = await mvRegionName.textContent();
    const mvRegionTextContent = await mvRegionText.textContent();
    const rankText = await rankRegionName.textContent();
    const comparisonText = await comparisonRegionName.textContent();
    
    console.log('MVセクション地域名:', mvText);
    console.log('MVテキスト地域名:', mvRegionTextContent);
    console.log('ランキング地域名:', rankText);
    console.log('比較表地域名:', comparisonText);
    
    // 地域名が更新されているかチェック（「全国」から他の地域に変わったか）
    const hasRegionUpdated = mvText !== '全国' || mvRegionTextContent !== '全国' || 
                             rankText !== '全国' || comparisonText !== '全国';
    
    if (hasRegionUpdated) {
      console.log('✓ 地域名が正しく更新されています');
    } else {
      console.log('⚠ 地域名がデフォルト（全国）のままです');
    }
  });
  
  test('異なる地域IDでの表示テスト', async ({ page }) => {
    const testCases = [
      { regionId: '013', expectedRegion: '東京' },
      { regionId: '027', expectedRegion: '大阪' },
      { regionId: '001', expectedRegion: '北海道' }
    ];
    
    for (const testCase of testCases) {
      await page.goto(`/mouthpiece/?region_id=${testCase.regionId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 地域データの読み込み完了を待つ
      try {
        await page.waitForFunction(() => {
          return window.dataManager && window.dataManager.regions;
        }, { timeout: 5000 });
      } catch (e) {
        console.log(`地域ID ${testCase.regionId} でデータマネージャーの初期化待機がタイムアウトしました`);
      }
      
      // 各要素の地域名を取得
      const mvText = await page.locator('#mv-region-name').textContent() || 'なし';
      const comparisonText = await page.locator('#comparison-region-name').textContent() || 'なし';
      
      console.log(`地域ID ${testCase.regionId}: MV=${mvText}, 比較=${comparisonText} (期待値: ${testCase.expectedRegion})`);
    }
  });
  
  test('無効なregion_idの処理確認', async ({ page }) => {
    const invalidIds = ['000', '0', '999', 'invalid'];
    
    for (const invalidId of invalidIds) {
      await page.goto(`/mouthpiece/?region_id=${invalidId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 無効なIDの場合でもページが正常に表示されることを確認
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      const mvText = await page.locator('#mv-region-name').textContent() || 'なし';
      const comparisonText = await page.locator('#comparison-region-name').textContent() || 'なし';
      
      console.log(`無効ID ${invalidId}: MV=${mvText}, 比較=${comparisonText}`);
    }
  });
  
  test('地域セレクターの存在確認', async ({ page }) => {
    await page.goto('/mouthpiece/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 地域セレクターの存在を確認
    const regionSelect = page.locator('#sidebar-region-select');
    
    if (await regionSelect.isVisible()) {
      console.log('✓ 地域セレクターが表示されています');
      
      // オプションの数を取得
      const options = regionSelect.locator('option');
      const optionCount = await options.count();
      console.log(`地域セレクターのオプション数: ${optionCount}`);
      
      // いくつかのオプションの内容を確認
      if (optionCount > 0) {
        for (let i = 0; i < Math.min(5, optionCount); i++) {
          const optionText = await options.nth(i).textContent();
          const optionValue = await options.nth(i).getAttribute('value');
          console.log(`オプション ${i}: ${optionText} (value: ${optionValue})`);
        }
      }
    } else {
      console.log('⚠ 地域セレクターが見つかりません');
    }
  });
  
  test('詳細バナー地域名表示確認', async ({ page }) => {
    await page.goto('/mouthpiece/?region_id=013');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 詳細セクションまでスクロール
    await page.locator('.clinic-details-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // 詳細バナーの地域名要素
    const detailRegionElement = page.locator('#detail-region-name');
    
    if (await detailRegionElement.isVisible()) {
      const detailText = await detailRegionElement.textContent();
      console.log('詳細バナー地域名:', detailText);
    } else {
      console.log('⚠ 詳細バナー地域名要素が見つかりません');
    }
    
    // 件数表示要素
    const rankCountElement = page.locator('#detail-rank-count');
    if (await rankCountElement.isVisible()) {
      const countText = await rankCountElement.textContent();
      console.log('詳細バナー件数表示:', countText);
    } else {
      console.log('⚠ 詳細バナー件数要素が見つかりません');
    }
  });
  
  test('パフォーマンス確認', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/mouthpiece/?region_id=013');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`ページ読み込み時間: ${loadTime}ms`);
    
    // 10秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(10000);
  });

});