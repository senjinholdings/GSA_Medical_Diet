const { chromium } = require('playwright');

(async () => {
  console.log('🔍 タブ構造確認テスト\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    // コンソールログを全てキャプチャ
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ ページ読み込み完了\n');
    
    // 1. タブコンテナの存在確認
    console.log('📊 1. タブコンテナの確認:');
    const tabContainerInfo = await page.evaluate(() => {
      const container = document.querySelector('.comparison-tabs');
      const section = document.querySelector('.comparison-section');
      const table = document.querySelector('.comparison-table');
      
      return {
        hasContainer: !!container,
        hasSection: !!section,
        hasTable: !!table,
        containerHTML: container ? container.outerHTML.substring(0, 200) : null,
        containerChildren: container ? container.children.length : 0
      };
    });
    
    console.log(`  タブコンテナ: ${tabContainerInfo.hasContainer ? '✅' : '❌'}`);
    console.log(`  比較表セクション: ${tabContainerInfo.hasSection ? '✅' : '❌'}`);
    console.log(`  比較表テーブル: ${tabContainerInfo.hasTable ? '✅' : '❌'}`);
    if (tabContainerInfo.hasContainer) {
      console.log(`  子要素数: ${tabContainerInfo.containerChildren}`);
      console.log(`  HTML: ${tabContainerInfo.containerHTML}...`);
    }
    
    // 2. タブボタンの確認
    console.log('\n📊 2. タブボタンの確認:');
    const tabButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.comparison-tab-menu-item, .tab-btn');
      return Array.from(buttons).map(btn => ({
        text: btn.textContent,
        className: btn.className,
        dataTab: btn.getAttribute('data-tab'),
        hasActive: btn.classList.contains('tab-active')
      }));
    });
    
    if (tabButtons.length > 0) {
      tabButtons.forEach((btn, i) => {
        console.log(`  ${i + 1}. ${btn.text}`);
        console.log(`     data-tab: ${btn.dataTab}`);
        console.log(`     アクティブ: ${btn.hasActive ? '✅' : '❌'}`);
      });
    } else {
      console.log('  タブボタンが見つかりません');
    }
    
    // 3. テーブルの確認
    console.log('\n📊 3. テーブルの確認:');
    const tableInfo = await page.evaluate(() => {
      const table = document.querySelector('.comparison-table');
      const thead = table ? table.querySelector('thead') : null;
      const tbody = table ? table.querySelector('tbody') : null;
      const headerRow = document.getElementById('comparison-header-row');
      const thElements = headerRow ? headerRow.querySelectorAll('th') : [];
      
      return {
        hasTable: !!table,
        hasThead: !!thead,
        hasTbody: !!tbody,
        hasHeaderRow: !!headerRow,
        headerCount: thElements.length,
        headers: Array.from(thElements).map(th => th.textContent),
        tbodyRows: tbody ? tbody.children.length : 0
      };
    });
    
    console.log(`  テーブル: ${tableInfo.hasTable ? '✅' : '❌'}`);
    console.log(`  thead: ${tableInfo.hasThead ? '✅' : '❌'}`);
    console.log(`  tbody: ${tableInfo.hasTbody ? '✅' : '❌'}`);
    console.log(`  headerRow: ${tableInfo.hasHeaderRow ? '✅' : '❌'}`);
    console.log(`  ヘッダー数: ${tableInfo.headerCount}`);
    if (tableInfo.headers.length > 0) {
      console.log(`  ヘッダー: ${tableInfo.headers.join(', ')}`);
    }
    console.log(`  データ行数: ${tableInfo.tbodyRows}`);
    
    // 4. setupComparisonTabsが呼ばれているか確認
    console.log('\n📊 4. JavaScript関数の確認:');
    const jsInfo = await page.evaluate(() => {
      return {
        hasApp: typeof window.app !== 'undefined',
        hasSetupComparisonTabs: window.app && typeof window.app.setupComparisonTabs === 'function',
        hasCreateTabButtons: window.app && typeof window.app.createTabButtons === 'function',
        hasGenerateComparisonTable: window.app && typeof window.app.generateComparisonTable === 'function'
      };
    });
    
    console.log(`  window.app: ${jsInfo.hasApp ? '✅' : '❌'}`);
    console.log(`  setupComparisonTabs: ${jsInfo.hasSetupComparisonTabs ? '✅' : '❌'}`);
    console.log(`  createTabButtons: ${jsInfo.hasCreateTabButtons ? '✅' : '❌'}`);
    console.log(`  generateComparisonTable: ${jsInfo.hasGenerateComparisonTable ? '✅' : '❌'}`);
    
    // 5. setupComparisonTabsを手動で実行
    if (jsInfo.hasSetupComparisonTabs) {
      console.log('\n📊 5. setupComparisonTabsを手動実行...');
      await page.evaluate(() => {
        window.app.setupComparisonTabs();
      });
      
      await page.waitForTimeout(1000);
      
      // 再度タブボタンを確認
      const afterTabs = await page.evaluate(() => {
        const buttons = document.querySelectorAll('.comparison-tab-menu-item, .tab-btn');
        return buttons.length;
      });
      
      console.log(`  実行後のタブボタン数: ${afterTabs}`);
    }
    
    console.log('\n👀 ブラウザを10秒間開いたままにします...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();