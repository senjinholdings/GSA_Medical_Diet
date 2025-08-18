const { test, expect } = require('@playwright/test');

test('INFORMATIONサブテキスト成功テスト', async ({ page }) => {
  // ページにアクセス
  await page.goto('/mouthpiece002/');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle');
  
  // JavaScriptが実行される時間を確保
  await page.waitForTimeout(10000);
  
  // first-choice-achievement-text要素を確認
  const achievementElement = page.locator('#first-choice-achievement-text');
  await expect(achievementElement).toBeVisible();
  
  // テキスト内容を取得
  const textContent = await achievementElement.textContent();
  console.log('表示されているテキスト:', textContent);
  
  // テキストが空でないことを確認
  expect(textContent).not.toBe('');
  expect(textContent).not.toBe(null);
  
  // 期待されるテキストが含まれることを確認
  expect(textContent).toContain('月額・総額がリーズナブルなクリニック');
  
  // 完全一致も確認
  expect(textContent).toBe('＼月額・総額がリーズナブルなクリニック／');
  
  console.log('✅ テストが成功しました！INFORMATIONサブテキストが正しく表示されています。');
});