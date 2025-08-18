const { chromium } = require('playwright');

(async () => {
  console.log('🔍 アコーディオン動作テスト\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    // コンソールログをキャプチャ
    page.on('console', msg => {
      if (msg.text().includes('toggle') || msg.text().includes('disclaimer')) {
        console.log('Console:', msg.text());
      }
    });
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ ページ読み込み完了\n');
    
    // 比較表までスクロール
    await page.evaluate(() => {
      const comparisonSection = document.querySelector('.comparison-section');
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);
    
    // 比較表下の「各クリニックの注意事項」の初期状態を確認
    console.log('📊 比較表下のアコーディオン初期状態:');
    const initialState = await page.evaluate(() => {
      const mainButton = document.querySelector('.comparison-section .main-disclaimer-header');
      const mainContent = document.getElementById('main-content');
      const mainArrow = document.getElementById('main-arrow');
      
      return {
        hasButton: !!mainButton,
        buttonOnclick: mainButton ? mainButton.getAttribute('onclick') : null,
        contentId: mainContent ? mainContent.id : null,
        contentDisplay: mainContent ? window.getComputedStyle(mainContent).display : null,
        arrowTransform: mainArrow ? window.getComputedStyle(mainArrow).transform : null
      };
    });
    
    console.log('  ボタン存在:', initialState.hasButton ? '✅' : '❌');
    console.log('  onclick属性:', initialState.buttonOnclick);
    console.log('  コンテンツID:', initialState.contentId);
    console.log('  初期表示状態:', initialState.contentDisplay);
    console.log('  矢印の変形:', initialState.arrowTransform);
    
    // ボタンをクリック
    console.log('\n🖱️ 「各クリニックの注意事項」ボタンをクリック...');
    await page.click('.comparison-section .main-disclaimer-header');
    await page.waitForTimeout(500);
    
    // クリック後の状態を確認
    const afterClick = await page.evaluate(() => {
      const mainContent = document.getElementById('main-content');
      const mainArrow = document.getElementById('main-arrow');
      
      return {
        contentDisplay: mainContent ? window.getComputedStyle(mainContent).display : null,
        arrowTransform: mainArrow ? window.getComputedStyle(mainArrow).transform : null,
        contentHTML: mainContent ? mainContent.innerHTML.substring(0, 200) : ''
      };
    });
    
    console.log('  クリック後表示状態:', afterClick.contentDisplay);
    console.log('  クリック後矢印:', afterClick.arrowTransform);
    console.log('  コンテンツ存在:', afterClick.contentHTML.length > 0 ? `✅ ${afterClick.contentHTML.length}文字` : '❌ 空');
    
    // もし開いた場合、個別クリニックのアコーディオンもテスト
    if (afterClick.contentDisplay === 'block') {
      console.log('\n🖱️ 個別クリニックのアコーディオンをテスト...');
      
      const individualClinic = await page.evaluate(() => {
        const firstButton = document.querySelector('.disclaimer-header');
        if (firstButton) {
          const clinicName = firstButton.querySelector('span')?.textContent;
          const onclick = firstButton.getAttribute('onclick');
          return { exists: true, clinicName, onclick };
        }
        return { exists: false };
      });
      
      if (individualClinic.exists) {
        console.log('  クリニック名:', individualClinic.clinicName);
        console.log('  onclick属性:', individualClinic.onclick);
        
        await page.click('.disclaimer-header');
        await page.waitForTimeout(500);
        
        const individualAfterClick = await page.evaluate(() => {
          const firstContent = document.querySelector('.disclaimer-content');
          return {
            display: firstContent ? window.getComputedStyle(firstContent).display : null,
            textLength: firstContent ? firstContent.textContent.length : 0
          };
        });
        
        console.log('  個別アコーディオン状態:', individualAfterClick.display === 'block' ? `✅ 開いた (${individualAfterClick.textLength}文字)` : '❌ 閉じたまま');
      }
    }
    
    // ランキング下のアコーディオンも同様にテスト
    console.log('\n📊 ランキング下のアコーディオンテスト:');
    await page.evaluate(() => {
      const rankingSection = document.getElementById('ranking-disclaimers-section');
      if (rankingSection) {
        rankingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);
    
    const rankingInitial = await page.evaluate(() => {
      const button = document.querySelector('#ranking-disclaimers-section .main-disclaimer-header');
      const content = document.getElementById('ranking-disclaimers-content');
      
      return {
        hasButton: !!button,
        buttonOnclick: button ? button.getAttribute('onclick') : null,
        contentDisplay: content ? window.getComputedStyle(content).display : null
      };
    });
    
    console.log('  ボタン存在:', rankingInitial.hasButton ? '✅' : '❌');
    console.log('  onclick属性:', rankingInitial.buttonOnclick);
    console.log('  初期表示状態:', rankingInitial.contentDisplay);
    
    if (rankingInitial.hasButton) {
      await page.click('#ranking-disclaimers-section .main-disclaimer-header');
      await page.waitForTimeout(500);
      
      const rankingAfterClick = await page.evaluate(() => {
        const content = document.getElementById('ranking-disclaimers-content');
        return {
          display: content ? window.getComputedStyle(content).display : null
        };
      });
      
      console.log('  クリック後表示状態:', rankingAfterClick.display);
    }
    
    console.log('\n👀 ブラウザを5秒間開いたままにします...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();