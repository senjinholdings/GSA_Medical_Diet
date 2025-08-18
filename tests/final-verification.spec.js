const { test, expect } = require('@playwright/test');

test('INFORMATIONサブテキスト最終検証', async ({ page }) => {
  // コンソールログをキャプチャ
  page.on('console', msg => {
    if (msg.text().includes('compiled-data') || msg.text().includes('DataManager') || msg.text().includes('404')) {
      console.log('Browser console:', msg.text());
    }
  });
  
  // ページにアクセス
  await page.goto('/mouthpiece002/');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle');
  
  // JavaScriptが実行される時間を十分に確保
  await page.waitForTimeout(15000);
  
  // DataManagerの状態を確認
  const dataManagerStatus = await page.evaluate(() => {
    return {
      exists: typeof window.dataManager !== 'undefined',
      hasClinicTexts: window.dataManager && typeof window.dataManager.clinicTexts !== 'undefined',
      hasGetClinicText: window.dataManager && typeof window.dataManager.getClinicText === 'function',
      clinicCount: window.dataManager && window.dataManager.clinicTexts ? Object.keys(window.dataManager.clinicTexts).length : 0
    };
  });
  
  console.log('DataManager最終状態:', dataManagerStatus);
  
  // DataManagerが正常に初期化されていることを確認
  expect(dataManagerStatus.exists).toBe(true);
  expect(dataManagerStatus.hasClinicTexts).toBe(true);
  expect(dataManagerStatus.hasGetClinicText).toBe(true);
  expect(dataManagerStatus.clinicCount).toBeGreaterThan(0);
  
  // first-choice-achievement-text要素を確認
  const achievementElement = page.locator('#first-choice-achievement-text');
  await expect(achievementElement).toBeVisible();
  
  // テキスト内容を取得
  const textContent = await achievementElement.textContent();
  console.log('取得されたテキスト:', textContent);
  
  // テキストが設定されていることを確認
  expect(textContent).not.toBe('');
  expect(textContent).not.toBe(null);
  
  // 期待値を確認（最初のクリニックのINFORMATIONサブテキスト）
  const expectedText = await page.evaluate(() => {
    const firstClinicCode = Object.keys(window.dataManager.clinicTexts)[0];
    return window.dataManager.getClinicText(firstClinicCode, 'INFORMATIONサブテキスト', 'デフォルト値');
  });
  
  console.log('期待されるテキスト:', expectedText);
  
  // テキストが期待値と一致することを確認
  expect(textContent).toBe(expectedText);
  
  // 「＼月額・総額がリーズナブルなクリニック／」が含まれることを確認（最初のクリニックの場合）
  if (expectedText.includes('月額・総額がリーズナブルなクリニック')) {
    console.log('✓ 期待されるテキストが正しく表示されています');
  }
});