const { test, expect } = require('@playwright/test');

test('地域だしわけテスト', async ({ page }) => {
  // 各地域IDをテスト
  const testCases = [
    { regionId: '000', expectedName: '全国' },
    { regionId: '001', expectedName: '東京' }, // 001 → 013にマップ
    { regionId: '013', expectedName: '東京' }, // 東京（存在）
    { regionId: '027', expectedName: '大阪' }, // 大阪（存在）
    { regionId: '040', expectedName: '福岡' }, // 福岡（存在）
    { regionId: '025', expectedName: '大阪' }, // 025 → 027にマップ
  ];
  
  for (const testCase of testCases) {
    console.log(`\n=== Testing region_id=${testCase.regionId} ===`);
    
    // ページにアクセス
    await page.goto(`/mouthpiece002/?region_id=${testCase.regionId}`);
    
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
    expect(mvRegionName).toBe(testCase.expectedName);
    expect(detailRegionName).toContain(testCase.expectedName);
  }
});