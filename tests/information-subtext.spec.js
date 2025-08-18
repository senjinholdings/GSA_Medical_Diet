const { test, expect } = require('@playwright/test');

test('INFORMATIONサブテキストの参照テスト', async ({ page }) => {
  // ページにアクセス
  await page.goto('/public/mouthpiece002/');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle');
  
  // JavaScriptが実行されるまで少し待機
  await page.waitForTimeout(2000);
  
  // first-choice-achievement-text要素を取得
  const achievementElement = page.locator('#first-choice-achievement-text');
  
  // 要素が存在することを確認
  await expect(achievementElement).toBeVisible();
  
  // テキスト内容を取得して表示
  const textContent = await achievementElement.textContent();
  console.log('取得されたテキスト:', textContent);
  
  // clinic-texts.jsonからINFORMATIONサブテキストを取得して比較
  const fs = require('fs');
  const path = require('path');
  const clinicTextsPath = path.join(__dirname, '../public/mouthpiece002/data/clinic-texts.json');
  const clinicTexts = JSON.parse(fs.readFileSync(clinicTextsPath, 'utf8'));
  
  console.log('期待されるテキスト:', clinicTexts['INFORMATIONサブテキスト']);
  
  // テキストが設定されていることを確認（空でないこと）
  expect(textContent).not.toBe('');
  expect(textContent).not.toBe(null);
  
  // デバッグ用：DataManagerの状態を確認
  const dataManagerExists = await page.evaluate(() => {
    return typeof window.dataManager !== 'undefined';
  });
  console.log('DataManager存在確認:', dataManagerExists);
  
  if (dataManagerExists) {
    const clinicTextMethod = await page.evaluate(() => {
      return typeof window.dataManager.getClinicText === 'function';
    });
    console.log('getClinicTextメソッド存在確認:', clinicTextMethod);
    
    // 実際にgetClinicTextを呼び出してみる
    const testResult = await page.evaluate(() => {
      try {
        // 最初のクリニックコードを取得
        const firstClinicCode = Object.keys(window.dataManager.clinicTexts || {})[0];
        if (firstClinicCode) {
          return window.dataManager.getClinicText(firstClinicCode, 'INFORMATIONサブテキスト', 'デフォルト値');
        }
        return 'クリニックコードが見つかりません';
      } catch (error) {
        return 'エラー: ' + error.message;
      }
    });
    console.log('getClinicText直接呼び出し結果:', testResult);
  }
  
  // どのクリニックが選択されているかを確認
  const selectedClinic = await page.evaluate(() => {
    const element = document.querySelector('[data-clinic-code]');
    return element ? element.getAttribute('data-clinic-code') : '見つかりません';
  });
  console.log('選択されているクリニック:', selectedClinic);
});