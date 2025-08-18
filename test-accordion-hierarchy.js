const { chromium } = require('playwright');

(async () => {
  console.log('🔍 アコーディオン階層のテスト\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ ページ読み込み完了\n');
    
    // 比較表下のアコーディオンをチェック
    console.log('📊 比較表下のアコーディオン:');
    const comparisonAccordion = await page.evaluate(() => {
      const button = document.querySelector('.main-disclaimer-header');
      const content = document.getElementById('main-content');
      const arrow = document.getElementById('main-arrow');
      
      return {
        hasButton: !!button,
        buttonText: button ? button.textContent.trim() : null,
        contentDisplay: content ? content.style.display : null,
        arrowRotation: arrow ? arrow.style.transform : null,
        childrenCount: content ? content.children.length : 0
      };
    });
    
    console.log('  ボタン:', comparisonAccordion.hasButton ? '✅ あり' : '❌ なし');
    console.log('  ボタンテキスト:', comparisonAccordion.buttonText);
    console.log('  初期状態:', comparisonAccordion.contentDisplay === 'none' ? '✅ 閉じている' : '⚠️ 開いている');
    console.log('  子要素数:', comparisonAccordion.childrenCount);
    
    // ランキング下のアコーディオンをチェック
    console.log('\n📊 ランキング下のアコーディオン:');
    const rankingAccordion = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.main-disclaimer-header');
      const rankingButton = buttons[0]; // 最初のボタンがランキング用
      const content = document.getElementById('ranking-disclaimers-content');
      const arrow = document.getElementById('ranking-main-arrow');
      
      return {
        hasButton: !!rankingButton,
        buttonText: rankingButton ? rankingButton.textContent.trim() : null,
        contentDisplay: content ? content.style.display : null,
        arrowRotation: arrow ? arrow.style.transform : null,
        childrenCount: content ? content.children.length : 0
      };
    });
    
    console.log('  ボタン:', rankingAccordion.hasButton ? '✅ あり' : '❌ なし');
    console.log('  ボタンテキスト:', rankingAccordion.buttonText);
    console.log('  初期状態:', rankingAccordion.contentDisplay === 'none' ? '✅ 閉じている' : '⚠️ 開いている');
    console.log('  子要素数:', rankingAccordion.childrenCount);
    
    // ランキング下のアコーディオンをクリック
    console.log('\n🖱️ ランキング下のアコーディオンをクリック...');
    await page.click('#ranking-disclaimers-section .main-disclaimer-header');
    await page.waitForTimeout(500);
    
    const rankingAfterClick = await page.evaluate(() => {
      const content = document.getElementById('ranking-disclaimers-content');
      const arrow = document.getElementById('ranking-main-arrow');
      
      return {
        contentDisplay: content ? content.style.display : null,
        arrowRotation: arrow ? arrow.style.transform : null,
        childrenCount: content ? content.children.length : 0,
        childrenHTML: content && content.children.length > 0 ? content.innerHTML.substring(0, 200) : ''
      };
    });
    
    console.log('  開閉状態:', rankingAfterClick.contentDisplay === 'block' ? '✅ 開いた' : '❌ 閉じたまま');
    console.log('  矢印回転:', rankingAfterClick.arrowRotation);
    console.log('  子要素数:', rankingAfterClick.childrenCount);
    
    if (rankingAfterClick.childrenCount > 0) {
      console.log('  ✅ 注意事項が表示されています');
    } else {
      console.log('  ⚠️ 注意事項が空です');
    }
    
    // 比較表下のアコーディオンをクリック
    console.log('\n🖱️ 比較表下のアコーディオンをクリック...');
    await page.evaluate(() => {
      window.scrollTo(0, document.querySelector('.comparison-section').offsetTop);
    });
    await page.waitForTimeout(500);
    
    await page.click('.comparison-section .main-disclaimer-header');
    await page.waitForTimeout(500);
    
    const comparisonAfterClick = await page.evaluate(() => {
      const content = document.getElementById('main-content');
      const arrow = document.getElementById('main-arrow');
      
      return {
        contentDisplay: content ? content.style.display : null,
        arrowRotation: arrow ? arrow.style.transform : null,
        childrenCount: content ? content.children.length : 0
      };
    });
    
    console.log('  開閉状態:', comparisonAfterClick.contentDisplay === 'block' ? '✅ 開いた' : '❌ 閉じたまま');
    console.log('  矢印回転:', comparisonAfterClick.arrowRotation);
    console.log('  子要素数:', comparisonAfterClick.childrenCount);
    
    if (comparisonAfterClick.childrenCount > 0) {
      console.log('  ✅ 注意事項が表示されています');
      
      // 第2段階のアコーディオン（個別クリニック）もテスト
      console.log('\n🖱️ 個別クリニックのアコーディオンをクリック...');
      const firstClinicButton = await page.$('.disclaimer-header');
      if (firstClinicButton) {
        await firstClinicButton.click();
        await page.waitForTimeout(500);
        
        const clinicDisclaimer = await page.evaluate(() => {
          const firstContent = document.querySelector('.disclaimer-content');
          return {
            isVisible: firstContent && firstContent.style.display === 'block',
            textLength: firstContent ? firstContent.textContent.length : 0
          };
        });
        
        console.log('  個別クリニック注意事項:', clinicDisclaimer.isVisible ? `✅ 表示 (${clinicDisclaimer.textLength}文字)` : '❌ 非表示');
      }
    }
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'accordion-hierarchy.png', fullPage: true });
    console.log('\n📸 スクリーンショット保存: accordion-hierarchy.png');
    
    console.log('\n👀 ブラウザを5秒間開いたままにします...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();