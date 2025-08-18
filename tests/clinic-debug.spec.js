const { test, expect } = require('@playwright/test');

test('クリニックデータ詳細確認', async ({ page }) => {
  await page.goto('/mouthpiece002/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(10000);
  
  const clinicData = await page.evaluate(() => {
    if (!window.dataManager) return { error: 'DataManager not found' };
    
    const clinicCodes = Object.keys(window.dataManager.clinicTexts);
    const firstClinicCode = clinicCodes[0];
    
    return {
      allClinicCodes: clinicCodes,
      firstClinicCode: firstClinicCode,
      firstClinicData: window.dataManager.clinicTexts[firstClinicCode],
      informationSubTextExists: window.dataManager.clinicTexts[firstClinicCode] && 
                                'INFORMATIONサブテキスト' in window.dataManager.clinicTexts[firstClinicCode],
      informationSubText: window.dataManager.clinicTexts[firstClinicCode] && 
                         window.dataManager.clinicTexts[firstClinicCode]['INFORMATIONサブテキスト'],
      getClinicTextResult: window.dataManager.getClinicText(firstClinicCode, 'INFORMATIONサブテキスト', 'デフォルト値'),
      // 実際に表示されているクリニックの確認
      currentDisplayedClinic: (() => {
        // 1位のクリニックを取得する処理を模擬
        const regionId = '013'; // 東京
        const ranking = window.dataManager.getRankingByRegionId(regionId);
        if (ranking && ranking.ranks) {
          const topRank = ranking.ranks['1'];
          return {
            topRankClinicId: topRank,
            topRankClinicCode: window.dataManager.getClinicCodeById(topRank)
          };
        }
        return null;
      })()
    };
  });
  
  console.log('クリニックデータ詳細:', JSON.stringify(clinicData, null, 2));
  
  // 実際に表示されているクリニックのINFORMATIONサブテキストを確認
  if (clinicData.currentDisplayedClinic && clinicData.currentDisplayedClinic.topRankClinicCode) {
    const displayedClinicInfo = await page.evaluate((clinicCode) => {
      return {
        clinicCode: clinicCode,
        informationSubText: window.dataManager.clinicTexts[clinicCode] && 
                           window.dataManager.clinicTexts[clinicCode]['INFORMATIONサブテキスト'],
        getClinicTextResult: window.dataManager.getClinicText(clinicCode, 'INFORMATIONサブテキスト', 'デフォルト値')
      };
    }, clinicData.currentDisplayedClinic.topRankClinicCode);
    
    console.log('表示中のクリニック情報:', displayedClinicInfo);
  }
});