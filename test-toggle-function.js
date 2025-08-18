const { chromium } = require('playwright');

(async () => {
  console.log('🔍 toggleMainDisclaimer関数のテスト\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    // コンソールログをキャプチャ
    page.on('console', msg => {
      console.log('Console:', msg.text());
    });
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ ページ読み込み完了\n');
    
    // ランキング下のアコーディオンの初期状態
    console.log('📊 初期状態:');
    const initialState = await page.evaluate(() => {
      const content = document.getElementById('ranking-disclaimers-content');
      const arrow = document.getElementById('ranking-main-arrow');
      return {
        contentDisplay: content ? content.style.display : 'not found',
        contentComputedDisplay: content ? window.getComputedStyle(content).display : 'not found',
        arrowTransform: arrow ? arrow.style.transform : 'not found'
      };
    });
    console.log('  content.style.display:', initialState.contentDisplay);
    console.log('  computed display:', initialState.contentComputedDisplay);
    console.log('  arrow transform:', initialState.arrowTransform);
    
    // 手動でtoggleMainDisclaimerを呼び出す
    console.log('\n🔧 toggleMainDisclaimer("ranking")を手動実行...');
    const toggleResult = await page.evaluate(() => {
      // 関数を直接実行
      if (typeof toggleMainDisclaimer === 'function') {
        toggleMainDisclaimer('ranking');
        
        const content = document.getElementById('ranking-disclaimers-content');
        const arrow = document.getElementById('ranking-main-arrow');
        return {
          success: true,
          contentDisplay: content ? content.style.display : 'not found',
          contentComputedDisplay: content ? window.getComputedStyle(content).display : 'not found',
          arrowTransform: arrow ? arrow.style.transform : 'not found'
        };
      } else {
        return { success: false, error: 'toggleMainDisclaimer not found' };
      }
    });
    
    if (toggleResult.success) {
      console.log('  ✅ 関数実行成功');
      console.log('  content.style.display:', toggleResult.contentDisplay);
      console.log('  computed display:', toggleResult.contentComputedDisplay);
      console.log('  arrow transform:', toggleResult.arrowTransform);
    } else {
      console.log('  ❌ エラー:', toggleResult.error);
    }
    
    // ボタンをクリック
    console.log('\n🖱️ ボタンをクリック...');
    await page.click('#ranking-disclaimers-section .main-disclaimer-header');
    await page.waitForTimeout(500);
    
    const afterClick = await page.evaluate(() => {
      const content = document.getElementById('ranking-disclaimers-content');
      const arrow = document.getElementById('ranking-main-arrow');
      return {
        contentDisplay: content ? content.style.display : 'not found',
        contentComputedDisplay: content ? window.getComputedStyle(content).display : 'not found',
        arrowTransform: arrow ? arrow.style.transform : 'not found'
      };
    });
    
    console.log('  content.style.display:', afterClick.contentDisplay);
    console.log('  computed display:', afterClick.contentComputedDisplay);
    console.log('  arrow transform:', afterClick.arrowTransform);
    
    // 比較表下も同様にテスト
    console.log('\n📊 比較表下のアコーディオン:');
    await page.evaluate(() => {
      window.scrollTo(0, document.querySelector('.comparison-section').offsetTop);
    });
    await page.waitForTimeout(500);
    
    const comparisonInitial = await page.evaluate(() => {
      const content = document.getElementById('main-content');
      return {
        contentDisplay: content ? content.style.display : 'not found',
        contentComputedDisplay: content ? window.getComputedStyle(content).display : 'not found'
      };
    });
    console.log('  初期状態 - style.display:', comparisonInitial.contentDisplay);
    console.log('  初期状態 - computed:', comparisonInitial.contentComputedDisplay);
    
    // toggleMainDisclaimer()を実行（パラメータなし）
    console.log('\n🔧 toggleMainDisclaimer()を実行...');
    await page.evaluate(() => {
      toggleMainDisclaimer();
    });
    await page.waitForTimeout(500);
    
    const comparisonAfterToggle = await page.evaluate(() => {
      const content = document.getElementById('main-content');
      return {
        contentDisplay: content ? content.style.display : 'not found',
        contentComputedDisplay: content ? window.getComputedStyle(content).display : 'not found'
      };
    });
    console.log('  実行後 - style.display:', comparisonAfterToggle.contentDisplay);
    console.log('  実行後 - computed:', comparisonAfterToggle.contentComputedDisplay);
    
    console.log('\n👀 ブラウザを5秒間開いたままにします...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();