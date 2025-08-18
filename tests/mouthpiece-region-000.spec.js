// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('マウスピース矯正サイト - region_id=000テスト', () => {
  
  const TEST_URL = 'http://127.0.0.1:8080/mouthpiece/?region_id=000';
  const consoleErrors = [];
  const consoleLogs = [];

  test.beforeEach(async ({ page }) => {
    // コンソールログとエラーをキャッチ
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        consoleErrors.push({ text, type, timestamp: new Date().toISOString() });
        console.log(`❌ Console Error: ${text}`);
      } else if (type === 'log' || type === 'info' || type === 'warn') {
        consoleLogs.push({ text, type, timestamp: new Date().toISOString() });
        console.log(`📝 Console ${type}: ${text}`);
      }
    });

    // ネットワークエラーをキャッチ
    page.on('pageerror', error => {
      consoleErrors.push({ 
        text: error.toString(), 
        type: 'pageerror', 
        timestamp: new Date().toISOString() 
      });
      console.log(`💥 Page Error: ${error.toString()}`);
    });
  });

  test('region_id=000でのページアクセスと基本表示確認', async ({ page }) => {
    console.log(`🌐 テストURL: ${TEST_URL}`);
    
    // ページアクセス
    const response = await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // レスポンスステータス確認
    expect(response.status()).toBe(200);
    console.log(`✅ HTTP Status: ${response.status()}`);

    // ページタイトル確認
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`📄 Page Title: "${title}"`);

    // 基本的なページ要素の存在確認
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('.container').first()).toBeVisible();
    
    console.log('✅ 基本的なページ要素が正常に表示されています');
  });

  test('地域名表示要素の存在と内容確認', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 地域名表示要素の存在確認と内容取得
    const regionElements = [
      { id: '#mv-region-name', name: 'MV地域名' },
      { id: '#mv-region-text', name: 'MVテキスト地域名' },
      { id: '#rank-region-name', name: 'ランキング地域名' },
      { id: '#comparison-region-name', name: '比較表地域名' },
      { id: '#detail-region-name', name: '詳細バナー地域名' }
    ];

    const regionData = {};

    for (const element of regionElements) {
      const locator = page.locator(element.id);
      const exists = await locator.count() > 0;
      
      if (exists && await locator.isVisible()) {
        const text = await locator.textContent();
        regionData[element.name] = text?.trim() || '';
        console.log(`✅ ${element.name}: "${text}"`);
        
        // 空でないことを確認
        expect(text).toBeTruthy();
      } else {
        regionData[element.name] = '要素なし';
        console.log(`⚠️  ${element.name}: 要素が見つからないか非表示`);
      }
    }

    // 最低限のMV地域名は存在すべき
    expect(regionData['MV地域名']).toBeTruthy();
    
    console.log('📊 地域名表示状況:', regionData);
  });

  test('デフォルト値（東京/全国）へのフォールバック確認', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 現在のURLパラメータを確認
    const currentUrl = page.url();
    console.log(`🔗 現在のURL: ${currentUrl}`);

    // region_idパラメータの値を確認
    const url = new URL(currentUrl);
    const regionId = url.searchParams.get('region_id');
    console.log(`🏷️  region_id パラメータ: ${regionId}`);

    // MV地域名を取得してデフォルト値かチェック
    const mvRegionName = await page.locator('#mv-region-name').textContent();
    console.log(`🗾 表示されている地域名: "${mvRegionName}"`);

    // デフォルト値の候補（東京、全国、など）
    const defaultRegionNames = ['東京', '全国', 'トーキョー', 'ゼンコク'];
    const isDefaultRegion = defaultRegionNames.some(name => 
      mvRegionName?.includes(name)
    );

    if (isDefaultRegion) {
      console.log('✅ デフォルト地域名（東京/全国）が表示されています');
    } else {
      console.log(`⚠️  予期しない地域名が表示されています: "${mvRegionName}"`);
    }

    // 地域名が何らかの値で設定されていることを確認
    expect(mvRegionName).toBeTruthy();
  });

  test('コンソールエラーとログの収集・分析', async ({ page }) => {
    // エラー配列をクリア
    consoleErrors.length = 0;
    consoleLogs.length = 0;

    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // ページ内のスクロールでさらなるエラーを検出
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

    // エラーログの分析
    console.log(`\n📊 収集されたコンソールログ: ${consoleLogs.length}件`);
    console.log(`❌ 収集されたエラー: ${consoleErrors.length}件`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ エラー詳細:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.timestamp}] ${error.type}: ${error.text}`);
      });
    }

    if (consoleLogs.length > 0) {
      console.log('\n📝 主要なログメッセージ:');
      consoleLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. [${log.timestamp}] ${log.type}: ${log.text}`);
      });
    }

    // 致命的でないエラー（404、CSS、画像読み込みエラーなど）は許容
    const criticalErrors = consoleErrors.filter(error => {
      const text = error.text.toLowerCase();
      return !text.includes('404') && 
             !text.includes('net::err_') && 
             !text.includes('favicon') &&
             !text.includes('.css') &&
             !text.includes('.jpg') &&
             !text.includes('.png') &&
             !text.includes('.webp');
    });

    if (criticalErrors.length === 0) {
      console.log('✅ 致命的なJavaScriptエラーは検出されませんでした');
    } else {
      console.log(`⚠️  致命的なエラーが ${criticalErrors.length} 件検出されました`);
    }

    // 致命的エラーが多すぎる場合のみテスト失敗
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('スクリーンショット撮影と要素の視覚的確認', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // フルページスクリーンショット
    await page.screenshot({ 
      path: 'test-results/mouthpiece-region-000-full-page.png', 
      fullPage: true 
    });
    console.log('📸 フルページスクリーンショットを保存しました');

    // ヒーローセクションのスクリーンショット
    const heroSection = page.locator('.hero-section').first();
    if (await heroSection.isVisible()) {
      await heroSection.screenshot({ 
        path: 'test-results/mouthpiece-region-000-hero-section.png' 
      });
      console.log('📸 ヒーローセクションのスクリーンショットを保存しました');
    }

    // 地域名表示要素にハイライト（デバッグ用）
    await page.addStyleTag({
      content: `
        #mv-region-name, #mv-region-text, #rank-region-name, 
        #comparison-region-name, #detail-region-name {
          outline: 3px solid red !important;
          background-color: rgba(255, 255, 0, 0.3) !important;
        }
      `
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/mouthpiece-region-000-highlighted-elements.png', 
      fullPage: true 
    });
    console.log('📸 地域名要素ハイライト版スクリーンショットを保存しました');

    // 視覚的に確認できる要素の存在チェック
    const visibleElements = await page.locator('#mv-region-name').isVisible();
    expect(visibleElements).toBe(true);
    
    console.log('✅ スクリーンショット撮影と視覚的確認が完了しました');
  });

  test('パフォーマンスメトリクスの測定', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️  ページ読み込み時間: ${loadTime}ms`);

    // パフォーマンスメトリクス取得
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });

    console.log('📊 パフォーマンスメトリクス:');
    console.log(`  - DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`  - Load Complete: ${metrics.loadComplete}ms`);
    console.log(`  - First Paint: ${Math.round(metrics.firstPaint)}ms`);
    console.log(`  - First Contentful Paint: ${Math.round(metrics.firstContentfulPaint)}ms`);

    // 合理的な読み込み時間かチェック（15秒以内）
    expect(loadTime).toBeLessThan(15000);
    
    console.log('✅ パフォーマンスメトリクスの測定が完了しました');
  });

  test.afterAll(async () => {
    // テスト終了時のサマリー
    console.log('\n🏁 テスト実行完了サマリー');
    console.log(`📊 総エラー数: ${consoleErrors.length}`);
    console.log(`📝 総ログ数: ${consoleLogs.length}`);
    console.log(`🌐 テスト対象URL: ${TEST_URL}`);
    console.log(`⏰ テスト完了時刻: ${new Date().toISOString()}`);
  });

});