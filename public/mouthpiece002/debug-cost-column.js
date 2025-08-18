const { test, expect } = require('@playwright/test');

test.describe('コスト列デバッグテスト', () => {
  test('コスト列が空になる問題の調査', async ({ page }) => {
    await page.goto('/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#comparison-table', { timeout: 10000 });

    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(2000);

    console.log('🔍 初期表示での総合タブの確認');
    
    // 総合タブが選択されているかチェック
    const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
    const activeTabText = await activeTab.textContent();
    console.log('✅ アクティブタブ:', activeTabText);

    // ヘッダーの確認
    const headers = await page.locator('#comparison-table thead th:visible');
    const headerTexts = await headers.allTextContents();
    console.log('✅ ヘッダー:', headerTexts);

    // データの確認 - 最初の行のコスト列（3番目の列）
    const firstRowCells = await page.locator('#comparison-table tbody tr:first-child td');
    const cellCount = await firstRowCells.count();
    console.log('✅ 最初の行のセル数:', cellCount);

    if (cellCount >= 3) {
      const costCell = await firstRowCells.nth(2);
      const costCellContent = await costCell.innerHTML();
      const costCellText = await costCell.textContent();
      console.log('✅ コスト列の内容(HTML):', costCellContent);
      console.log('✅ コスト列の内容(Text):', costCellText?.trim());
    }

    // JavaScript環境でのデータ確認
    await page.evaluate(() => {
      console.log('🔍 JavaScript環境でのデバッグ:');
      
      // DataManagerの確認
      if (window.dataManager) {
        console.log('✅ DataManager は存在します');
        
        // clinic-textsの確認
        if (window.dataManager.clinicTexts) {
          console.log('✅ clinic-texts データ:', Object.keys(window.dataManager.clinicTexts));
          
          // Oh my teethのデータ確認
          const ohMyTeethData = window.dataManager.clinicTexts['Oh my teeth'];
          if (ohMyTeethData) {
            console.log('✅ Oh my teeth データ存在');
            console.log('✅ Oh my teeth コスト:', ohMyTeethData['コスト']);
          } else {
            console.log('❌ Oh my teeth データが見つからない');
          }
        } else {
          console.log('❌ clinic-texts データが存在しない');
        }

        // getClinicTextメソッドのテスト
        try {
          const costData = window.dataManager.getClinicText('ohmyteeth', 'コスト', '');
          console.log('✅ getClinicText result:', costData);
        } catch (error) {
          console.log('❌ getClinicText error:', error);
        }
      } else {
        console.log('❌ DataManager が存在しません');
      }
    });

    // 手動でテーブル再生成をテスト
    console.log('🔧 手動でテーブル再生成をテスト...');
    await page.evaluate(() => {
      if (window.dataManager && window.dataManager.getClinicText) {
        // 手動でregenerateTableForTabを呼び出し
        const app = document.rankingApp || window.rankingApp;
        if (app && app.regenerateTableForTab) {
          const tabFieldMappings = {
            'tab1': ['クリニック名', '総合評価', 'コスト', '特徴', '公式サイト']
          };
          app.regenerateTableForTab('tab1', tabFieldMappings['tab1']);
          console.log('✅ 手動テーブル再生成を実行');
        }
      }
    });

    await page.waitForTimeout(1000);

    // 再生成後のデータ確認
    const firstRowCellsAfter = await page.locator('#comparison-table tbody tr:first-child td');
    if (await firstRowCellsAfter.count() >= 3) {
      const costCellAfter = await firstRowCellsAfter.nth(2);
      const costCellContentAfter = await costCellAfter.innerHTML();
      const costCellTextAfter = await costCellAfter.textContent();
      console.log('🔧 再生成後 コスト列の内容(HTML):', costCellContentAfter);
      console.log('🔧 再生成後 コスト列の内容(Text):', costCellTextAfter?.trim());
    }
  });
});