const { test, expect } = require('@playwright/test');

test('JavaScript読み込みデバッグテスト', async ({ page }) => {
  // コンソールログをキャプチャ
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  // エラーをキャプチャ
  page.on('pageerror', error => console.log('Page error:', error.message));
  
  // ネットワークリクエストをモニター
  page.on('request', request => {
    if (request.url().includes('app.js')) {
      console.log('App.js request:', request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('app.js')) {
      console.log('App.js response:', response.status(), response.url());
    }
  });
  
  // ページにアクセス
  await page.goto('/mouthpiece002/');
  
  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('networkidle');
  
  // 少し長めに待機してJavaScriptが実行される時間を確保
  await page.waitForTimeout(10000);
  
  // DataManagerの状態を詳しく確認
  const jsStatus = await page.evaluate(() => {
    const result = {
      windowObjects: Object.keys(window).filter(key => key.includes('data') || key.includes('Data') || key.includes('manager')),
      dataManagerExists: typeof window.dataManager !== 'undefined',
      dataManagerType: typeof window.dataManager,
      dataManagerKeys: window.dataManager ? Object.keys(window.dataManager) : null,
      hasClinicTexts: window.dataManager && window.dataManager.clinicTexts,
      clinicTextsKeys: window.dataManager && window.dataManager.clinicTexts ? Object.keys(window.dataManager.clinicTexts) : null,
      documentReadyState: document.readyState,
      scriptsLoaded: Array.from(document.scripts).map(script => script.src).filter(src => src.includes('app.js'))
    };
    
    // DataManagerが存在する場合、getClinicTextメソッドを試す
    if (window.dataManager && typeof window.dataManager.getClinicText === 'function') {
      try {
        const firstClinicCode = Object.keys(window.dataManager.clinicTexts || {})[0];
        if (firstClinicCode) {
          result.testGetClinicText = window.dataManager.getClinicText(firstClinicCode, 'INFORMATIONサブテキスト', 'デフォルト値');
        }
      } catch (error) {
        result.getClinicTextError = error.message;
      }
    }
    
    return result;
  });
  
  console.log('JavaScript状態:', JSON.stringify(jsStatus, null, 2));
  
  // first-choice-achievement-text要素の状態確認
  const elementStatus = await page.evaluate(() => {
    const element = document.getElementById('first-choice-achievement-text');
    return {
      exists: !!element,
      textContent: element ? element.textContent : null,
      innerHTML: element ? element.innerHTML : null,
      parentElement: element && element.parentElement ? element.parentElement.tagName : null,
      isVisible: element ? window.getComputedStyle(element).display !== 'none' : false
    };
  });
  
  console.log('要素状態:', elementStatus);
  
  // 手動でupdateFirstChoiceRecommendation関数を探す
  const functionExists = await page.evaluate(() => {
    // グローバルスコープの関数をチェック
    const globalFunctions = [];
    for (let key in window) {
      if (typeof window[key] === 'function' && key.includes('First') || key.includes('Choice') || key.includes('update')) {
        globalFunctions.push(key);
      }
    }
    return globalFunctions;
  });
  
  console.log('関連する関数:', functionExists);
});