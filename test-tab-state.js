const { chromium, devices } = require('playwright');

(async () => {
  console.log('🔍 タブ状態とボタン構造を確認\n');
  
  const browser = await chromium.launch({ headless: false });
  const iPhone = devices['iPhone 12'];
  
  try {
    const context = await browser.newContext(iPhone);
    const page = await context.newPage();
    
    // mouthpiece002をURLパラメータ付きで開く
    await page.goto('http://localhost:3000/mouthpiece002/?comparison_tab=%E6%96%BD%E8%A1%93%E5%86%85%E5%AE%B9&max_scroll=25');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.comparison-table', { timeout: 10000 });
    
    console.log('✅ ページ読み込み完了');
    
    // 現在のタブ状態を確認
    const tabState = await page.evaluate(() => {
      const activeTab = document.querySelector('.comparison-tab-menu-item.tab-active');
      const allTabs = document.querySelectorAll('.comparison-tab-menu-item');
      
      return {
        activeTabText: activeTab ? activeTab.textContent.trim() : 'なし',
        activeTabData: activeTab ? activeTab.getAttribute('data-tab') : 'なし',
        allTabs: Array.from(allTabs).map(tab => ({
          text: tab.textContent.trim(),
          dataTab: tab.getAttribute('data-tab'),
          isActive: tab.classList.contains('tab-active')
        }))
      };
    });
    
    console.log('📊 タブ状態:');
    console.log('  アクティブタブ:', tabState.activeTabText);
    console.log('  data-tab値:', tabState.activeTabData);
    console.log('  全タブ:');
    tabState.allTabs.forEach(tab => {
      console.log(`    - ${tab.text} (data-tab="${tab.dataTab}", active=${tab.isActive})`);
    });
    
    // URLパラメータの解析
    const url = new URL(page.url());
    const comparisonTab = url.searchParams.get('comparison_tab');
    console.log('\n  URLパラメータ comparison_tab:', comparisonTab);
    
    // 施術内容タブをクリック
    console.log('\n🔄 施術内容タブをクリック...');
    await page.click('[data-tab="tab2"]');
    await page.waitForTimeout(1000);
    
    // タブクリック後の公式サイト列を確認
    const afterClickHTML = await page.evaluate(() => {
      const firstRow = document.querySelector('.comparison-table tbody tr:first-child');
      const lastCell = firstRow ? firstRow.querySelector('td:last-child') : null;
      
      if (lastCell) {
        return {
          html: lastCell.innerHTML,
          buttons: Array.from(lastCell.querySelectorAll('a')).map(btn => ({
            text: btn.textContent.trim(),
            className: btn.className,
            href: btn.href
          }))
        };
      }
      return null;
    });
    
    console.log('\n📊 タブクリック後の公式サイト列:');
    if (afterClickHTML) {
      console.log('  ボタン数:', afterClickHTML.buttons.length);
      afterClickHTML.buttons.forEach((btn, index) => {
        console.log(`  ボタン${index + 1}: "${btn.text}" (class: ${btn.className})`);
      });
      
      if (afterClickHTML.buttons.length === 0) {
        console.log('\n  ❌ ボタンが生成されていません');
        console.log('  HTML内容:', afterClickHTML.html.substring(0, 100) + '...');
      } else {
        console.log('\n  ✅ ボタンが正しく生成されています');
      }
    }
    
    // スクリーンショット
    await page.screenshot({ path: 'mouthpiece-tab-state.png', fullPage: false });
    console.log('\n📸 スクリーンショット: mouthpiece-tab-state.png');
    
    console.log('\n👀 ブラウザを10秒間開いたままにします...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();