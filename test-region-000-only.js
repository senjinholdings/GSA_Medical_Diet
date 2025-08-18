const { test, expect } = require('@playwright/test');

test('地域000テスト', async ({ page }) => {
  console.log('\n=== Testing region_id=000 ===');
  
  // ページにアクセス
  await page.goto('/mouthpiece002/?region_id=000');
  
  // ページが読み込まれるまで待機
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // MV地域名を確認
  const mvRegionName = await page.locator('#mv-region-name').textContent();
  console.log(`MV地域名: ${mvRegionName}`);
  
  // 詳細セクション地域名を確認
  const detailRegionName = await page.locator('#detail-region-name').textContent();
  console.log(`詳細地域名: ${detailRegionName}`);
  
  // 期待される地域名と一致するかチェック
  expect(mvRegionName).toBe('全国');
  expect(detailRegionName).toContain('全国');
});