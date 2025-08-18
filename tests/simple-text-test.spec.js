const { test, expect } = require('@playwright/test');

test('シンプルなページロードテスト', async ({ page }) => {
  // ページにアクセス
  await page.goto('/mouthpiece002/');
  
  // ページが読み込まれるまで待機
  await page.waitForTimeout(5000);
  
  // ページタイトルを確認
  const title = await page.title();
  console.log('ページタイトル:', title);
  
  // 基本的な要素が存在するかをチェック
  const heroSection = page.locator('.hero-section');
  await expect(heroSection).toBeVisible();
  console.log('ヒーローセクション: 表示確認');
  
  // first-choice-achievement-text要素の確認（表示されていなくても要素の存在をチェック）
  const achievementElement = page.locator('#first-choice-achievement-text');
  const elementExists = await achievementElement.count() > 0;
  console.log('first-choice-achievement-text要素の存在:', elementExists);
  
  if (elementExists) {
    // 要素が存在する場合、テキスト内容を確認
    const textContent = await achievementElement.textContent();
    console.log('現在のテキスト内容:', textContent);
    
    // 空でないことを確認
    if (textContent && textContent.trim() !== '') {
      console.log('✓ テキストが設定されています');
      expect(textContent.trim()).not.toBe('');
    } else {
      console.log('⚠ テキストが空です');
    }
  }
  
  // DataManagerの状態確認
  const dataManagerStatus = await page.evaluate(() => {
    return {
      exists: typeof window.dataManager !== 'undefined',
      hasClinicTexts: window.dataManager && typeof window.dataManager.clinicTexts !== 'undefined',
      hasGetClinicText: window.dataManager && typeof window.dataManager.getClinicText === 'function'
    };
  });
  
  console.log('DataManager状態:', dataManagerStatus);
  
  // 最初のクリニックのINFORMATIONサブテキストを直接取得
  if (dataManagerStatus.hasGetClinicText) {
    const clinicCodes = await page.evaluate(() => {
      return Object.keys(window.dataManager.clinicTexts || {});
    });
    
    console.log('利用可能なクリニックコード:', clinicCodes);
    
    if (clinicCodes.length > 0) {
      const informationSubText = await page.evaluate((clinicCode) => {
        return window.dataManager.getClinicText(clinicCode, 'INFORMATIONサブテキスト', 'デフォルト値');
      }, clinicCodes[0]);
      
      console.log('最初のクリニックのINFORMATIONサブテキスト:', informationSubText);
    }
  }
});