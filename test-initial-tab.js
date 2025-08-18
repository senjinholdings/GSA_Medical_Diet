const { chromium, devices } = require('playwright');

(async () => {
  console.log('🔍 初期表示時のタブ状態を確認\n');
  
  const browser = await chromium.launch({ headless: false });
  const iPhone = devices['iPhone 12'];
  
  try {
    const context = await browser.newContext(iPhone);
    const page = await context.newPage();
    
    // mouthpiece002を開く（パラメータなし）
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.comparison-table', { timeout: 10000 });
    
    console.log('✅ ページ読み込み完了');
    
    // 初期表示の状態を確認
    const initialState = await page.evaluate(() => {
      const activeTab = document.querySelector('.comparison-tab-menu-item.tab-active');
      const headerRow = document.querySelector('#comparison-header-row');
      const firstRow = document.querySelector('#comparison-tbody tr:first-child');
      
      const headers = headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent.trim()) : [];
      const cells = firstRow ? Array.from(firstRow.querySelectorAll('td')) : [];
      
      return {
        activeTabText: activeTab ? activeTab.textContent.trim() : 'なし',
        activeTabData: activeTab ? activeTab.getAttribute('data-tab') : 'なし',
        headerCount: headers.length,
        headers: headers,
        cellCount: cells.length,
        hasPublicSiteButtons: cells.length > 0 && cells[cells.length - 1].querySelector('.link_btn') !== null
      };
    });
    
    console.log('\n📊 初期表示の状態:');
    console.log('  アクティブタブ:', initialState.activeTabText);
    console.log('  data-tab値:', initialState.activeTabData);
    console.log('  ヘッダー数:', initialState.headerCount);
    console.log('  ヘッダー:', initialState.headers.join(' | '));
    console.log('  セル数:', initialState.cellCount);
    console.log('  公式サイトボタン:', initialState.hasPublicSiteButtons ? '✅ あり' : '❌ なし');
    
    // スクリーンショット
    await page.screenshot({ path: 'initial-tab-state.png', fullPage: false });
    console.log('\n📸 初期表示: initial-tab-state.png');
    
    // Tab2をクリック
    console.log('\n🔄 施術内容タブをクリック...');
    await page.click('[data-tab="tab2"]');
    await page.waitForTimeout(1000);
    
    const tab2State = await page.evaluate(() => {
      const activeTab = document.querySelector('.comparison-tab-menu-item.tab-active');
      const headerRow = document.querySelector('#comparison-header-row');
      const firstRow = document.querySelector('#comparison-tbody tr:first-child');
      
      const headers = headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent.trim()) : [];
      const cells = firstRow ? Array.from(firstRow.querySelectorAll('td')) : [];
      
      return {
        activeTabText: activeTab ? activeTab.textContent.trim() : 'なし',
        headerCount: headers.length,
        headers: headers,
        cellCount: cells.length,
        hasPublicSiteButtons: cells.length > 0 && cells[cells.length - 1].querySelector('.link_btn') !== null
      };
    });
    
    console.log('\n📊 Tab2クリック後:');
    console.log('  アクティブタブ:', tab2State.activeTabText);
    console.log('  ヘッダー数:', tab2State.headerCount);
    console.log('  ヘッダー:', tab2State.headers.join(' | '));
    console.log('  公式サイトボタン:', tab2State.hasPublicSiteButtons ? '✅ あり' : '❌ なし');
    
    // 結果判定
    console.log('\n📋 結果:');
    if (initialState.headerCount === 5 && initialState.hasPublicSiteButtons) {
      console.log('  ✅ 初期表示が正しくTab1（総合）5列で表示されています');
    } else {
      console.log('  ❌ 初期表示に問題があります');
    }
    
    console.log('\n👀 ブラウザを10秒間開いたままにします...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();