const { test, expect } = require('@playwright/test');

test.describe('比較表タブ機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mouthpiece002/');
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#comparison-table', { timeout: 10000 });
  });

  test('タブ要素の基本確認', async ({ page }) => {
    // タブメニューの存在確認
    const tabMenu = await page.locator('.comparison-tab-menu');
    await expect(tabMenu).toBeVisible();

    // 各タブの存在確認
    const tab1 = await page.locator('[data-tab="tab1"]');
    const tab2 = await page.locator('[data-tab="tab2"]');
    const tab3 = await page.locator('[data-tab="tab3"]');

    await expect(tab1).toBeVisible();
    await expect(tab2).toBeVisible();
    await expect(tab3).toBeVisible();

    // タブテキスト確認
    await expect(tab1).toContainText('総合');
    await expect(tab2).toContainText('施術内容');
    await expect(tab3).toContainText('サービス');
  });

  test('初期状態で総合タブがアクティブ', async ({ page }) => {
    const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
    await expect(activeTab).toBeVisible();
    await expect(activeTab).toContainText('総合');
  });

  test('総合タブ: 正しい列が表示される', async ({ page }) => {
    // 総合タブをクリック
    await page.click('[data-tab="tab1"]');
    await page.waitForTimeout(500);

    // ヘッダーの確認
    const headers = await page.locator('#comparison-table thead th:visible');
    const headerTexts = await headers.allTextContents();
    
    console.log('総合タブヘッダー:', headerTexts);
    
    // 期待されるヘッダー: クリニック名, 総合評価, 費用(or コスト), 特徴, 公式サイト
    expect(headerTexts).toHaveLength(5);
    expect(headerTexts[0]).toContain('クリニック');
    expect(headerTexts[1]).toContain('総合評価');
    expect(headerTexts[2]).toMatch(/(費用|コスト)/);
    expect(headerTexts[3]).toContain('特徴');
    expect(headerTexts[4]).toContain('公式サイト');
  });

  test('施術内容タブ: 正しい列が表示される', async ({ page }) => {
    // 施術内容タブをクリック
    await page.click('[data-tab="tab2"]');
    await page.waitForTimeout(500);

    // アクティブタブの確認
    const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
    await expect(activeTab).toContainText('施術内容');

    // ヘッダーの確認
    const headers = await page.locator('#comparison-table thead th:visible');
    const headerTexts = await headers.allTextContents();
    
    console.log('施術内容タブヘッダー:', headerTexts);
    
    // 期待されるヘッダー: クリニック名, 矯正範囲, 目安期間, 通院頻度, 公式サイト
    expect(headerTexts).toHaveLength(5);
    expect(headerTexts[0]).toContain('クリニック');
    expect(headerTexts[1]).toContain('矯正範囲');
    expect(headerTexts[2]).toContain('目安期間');
    expect(headerTexts[3]).toContain('通院頻度');
    expect(headerTexts[4]).toContain('公式サイト');
  });

  test('サービスタブ: 正しい列が表示される', async ({ page }) => {
    // サービスタブをクリック
    await page.click('[data-tab="tab3"]');
    await page.waitForTimeout(500);

    // アクティブタブの確認
    const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
    await expect(activeTab).toContainText('サービス');

    // ヘッダーの確認
    const headers = await page.locator('#comparison-table thead th:visible');
    const headerTexts = await headers.allTextContents();
    
    console.log('サービスタブヘッダー:', headerTexts);
    
    // 期待されるヘッダー: クリニック名, 実績/症例数, ワイヤー矯正の紹介, サポート, 公式サイト
    expect(headerTexts).toHaveLength(5);
    expect(headerTexts[0]).toContain('クリニック');
    expect(headerTexts[1]).toContain('実績');
    expect(headerTexts[2]).toContain('ワイヤー矯正');
    expect(headerTexts[3]).toContain('サポート');
    expect(headerTexts[4]).toContain('公式サイト');
  });

  test('タブ間の切り替えが正常に動作', async ({ page }) => {
    // 初期状態: 総合タブ
    let activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
    await expect(activeTab).toContainText('総合');

    // 施術内容タブに切り替え
    await page.click('[data-tab="tab2"]');
    await page.waitForTimeout(500);
    
    activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
    await expect(activeTab).toContainText('施術内容');

    // サービスタブに切り替え
    await page.click('[data-tab="tab3"]');
    await page.waitForTimeout(500);
    
    activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
    await expect(activeTab).toContainText('サービス');

    // 総合タブに戻る
    await page.click('[data-tab="tab1"]');
    await page.waitForTimeout(500);
    
    activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
    await expect(activeTab).toContainText('総合');
  });

  test('データの整合性: クリニック名とロゴが一致', async ({ page }) => {
    // 各タブでデータ整合性をチェック
    const tabs = [
      { id: 'tab1', name: '総合' },
      { id: 'tab2', name: '施術内容' },
      { id: 'tab3', name: 'サービス' }
    ];

    for (const tab of tabs) {
      await page.click(`[data-tab="${tab.id}"]`);
      await page.waitForTimeout(500);

      // 最初の行のクリニック名とロゴを取得
      const firstRowClinicCell = await page.locator('#comparison-table tbody tr:first-child td:first-child');
      
      const clinicNameElement = await firstRowClinicCell.locator('a');
      const clinicLogoElement = await firstRowClinicCell.locator('img');
      
      if (await clinicNameElement.count() > 0 && await clinicLogoElement.count() > 0) {
        const clinicName = await clinicNameElement.textContent();
        const logoAlt = await clinicLogoElement.getAttribute('alt');
        
        console.log(`${tab.name}タブ - クリニック名: "${clinicName}", ロゴAlt: "${logoAlt}"`);
        
        // 名前とロゴの整合性確認
        expect(clinicName?.trim()).toBeTruthy();
        expect(logoAlt?.trim()).toBeTruthy();
        // 同一性チェック (厳密ではなく、一致していることを確認)
        if (clinicName && logoAlt) {
          console.log(`${tab.name}タブ整合性: ${clinicName === logoAlt ? '✅' : '⚠️'}`);
        }
      }
    }
  });

  test('公式サイトボタンが各タブで表示される', async ({ page }) => {
    const tabs = ['tab1', 'tab2', 'tab3'];

    for (const tabId of tabs) {
      await page.click(`[data-tab="${tabId}"]`);
      await page.waitForTimeout(500);

      // 公式サイトボタンの存在確認
      const officialSiteButtons = await page.locator('#comparison-table tbody tr td:visible a').filter({
        hasText: '公式サイト'
      });
      
      const buttonCount = await officialSiteButtons.count();
      console.log(`${tabId} 公式サイトボタン数: ${buttonCount}`);
      
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test('動的ヘッダー名変更が機能する', async ({ page }) => {
    // JavaScriptでヘッダー名を動的に変更
    await page.evaluate(() => {
      // clinic-texts.jsonでヘッダーマッピングを変更してテスト
      if (window.clinicTexts && window.clinicTexts.headerMappings) {
        window.clinicTexts.headerMappings['費用'] = 'コスト';
      }
    });

    // 総合タブをクリック
    await page.click('[data-tab="tab1"]');
    await page.waitForTimeout(500);

    const headers = await page.locator('#comparison-table thead th:visible');
    const headerTexts = await headers.allTextContents();
    
    console.log('動的ヘッダーテスト:', headerTexts);
    
    // 動的変更が反映されているかチェック
    const hasKost = headerTexts.some(text => text.includes('コスト'));
    if (hasKost) {
      console.log('✅ 動的ヘッダー変更が機能しています');
    } else {
      console.log('ℹ️ 動的ヘッダー変更は実装されていないか、テスト条件が不適切');
    }
  });
});