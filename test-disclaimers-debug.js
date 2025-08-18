const { chromium } = require('playwright');

(async () => {
  console.log('🔍 注意事項のデバッグ\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    // コンソールログをキャプチャ
    page.on('console', msg => {
      if (msg.text().includes('initializeDisclaimers') || msg.text().includes('disclaimer')) {
        console.log('Console:', msg.text());
      }
    });
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ ページ読み込み完了\n');
    
    // DataManagerとクリニックデータを確認
    const debugInfo = await page.evaluate(() => {
      const result = {
        hasDataManager: !!window.dataManager,
        hasApp: !!window.app,
        regionId: null,
        clinics: [],
        clinicCodes: [],
        disclaimers: {}
      };
      
      if (window.app) {
        result.regionId = window.app.currentRegionId;
      }
      
      if (window.dataManager) {
        // 東京のランキングを取得
        const ranking = window.dataManager.getRankingByRegionId('013');
        if (ranking && ranking.ranks) {
          for (let i = 1; i <= 5; i++) {
            const clinicId = ranking.ranks[`no${i}`];
            if (clinicId && clinicId !== '0') {
              const clinic = window.dataManager.getClinicById(clinicId);
              if (clinic) {
                result.clinics.push({
                  rank: i,
                  id: clinicId,
                  name: clinic.name,
                  code: clinic.code || ''
                });
                
                if (clinic.code) {
                  result.clinicCodes.push(clinic.code);
                  // 注意事項を取得
                  const disclaimer = window.dataManager.getClinicText(clinic.code, '比較表の注意事項', '');
                  if (disclaimer) {
                    result.disclaimers[clinic.code] = disclaimer.substring(0, 50) + '...';
                  }
                }
              }
            }
          }
        }
        
        // 全てのクリニックテキストを確認
        if (window.dataManager.clinicTexts) {
          result.allCodes = Object.keys(window.dataManager.clinicTexts);
        }
      }
      
      return result;
    });
    
    console.log('📊 デバッグ情報:');
    console.log('  DataManager:', debugInfo.hasDataManager ? '✅ あり' : '❌ なし');
    console.log('  RankingApp:', debugInfo.hasApp ? '✅ あり' : '❌ なし');
    console.log('  地域ID:', debugInfo.regionId);
    console.log('\n  クリニック情報:');
    debugInfo.clinics.forEach(clinic => {
      console.log(`    ${clinic.rank}位: ${clinic.name} (ID: ${clinic.id}, Code: ${clinic.code})`);
    });
    
    console.log('\n  注意事項の有無:');
    Object.entries(debugInfo.disclaimers).forEach(([code, text]) => {
      console.log(`    ${code}: ${text}`);
    });
    
    console.log('\n  利用可能なクリニックコード:');
    console.log('    ', debugInfo.allCodes?.join(', '));
    
    // initializeDisclaimersを手動で実行
    console.log('\n🔄 initializeDisclaimersを手動実行...');
    await page.evaluate(() => {
      if (typeof initializeDisclaimers === 'function') {
        initializeDisclaimers();
      }
    });
    
    await page.waitForTimeout(500);
    
    // 結果を確認
    const disclaimersAfter = await page.evaluate(() => {
      const ranking = document.getElementById('ranking-disclaimers-content');
      const comparison = document.getElementById('main-content');
      
      return {
        ranking: ranking ? ranking.innerHTML.length : 0,
        comparison: comparison ? comparison.innerHTML.length : 0
      };
    });
    
    console.log('\n📊 実行後の結果:');
    console.log('  ランキング下の注意事項:', disclaimersAfter.ranking > 0 ? `✅ ${disclaimersAfter.ranking}文字` : '❌ 空');
    console.log('  比較表下の注意事項:', disclaimersAfter.comparison > 0 ? `✅ ${disclaimersAfter.comparison}文字` : '❌ 空');
    
    console.log('\n👀 ブラウザを10秒間開いたままにします...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();