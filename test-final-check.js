const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Playwrightで比較表の最終確認...\n');
  
  const browser = await chromium.launch({ headless: false }); // ブラウザを表示
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#comparison-table', { timeout: 10000 });

    console.log('✅ ページ読み込み完了\n');
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'comparison-table-initial.png', fullPage: false });
    console.log('📸 初期状態のスクリーンショット: comparison-table-initial.png\n');

    // 初期状態（Tab1）の確認
    const tab1Data = await page.evaluate(() => {
      const result = {
        activeTab: '',
        headers: [],
        firstRowData: [],
        detailButtons: []
      };
      
      // アクティブなタブ
      const activeTab = document.querySelector('.comparison-tab-menu-item.tab-active');
      if (activeTab) result.activeTab = activeTab.textContent.trim();
      
      // ヘッダー
      const headers = document.querySelectorAll('#comparison-table thead th');
      result.headers = Array.from(headers).map(h => h.textContent.trim());
      
      // 最初の行のデータ
      const firstRow = document.querySelector('#comparison-table tbody tr:first-child');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        result.firstRowData = Array.from(cells).map(cell => ({
          text: cell.textContent.trim().replace(/\s+/g, ' '),
          hasContent: cell.innerHTML.length > 0
        }));
      }
      
      // 詳細を見るボタン
      const detailBtns = document.querySelectorAll('.comparison-table .detail_btn, .comparison-table .cta-link.detail-scroll-link');
      result.detailButtons = Array.from(detailBtns).map(btn => ({
        text: btn.textContent.trim(),
        className: btn.className,
        styles: {
          background: window.getComputedStyle(btn).backgroundColor,
          color: window.getComputedStyle(btn).color,
          border: window.getComputedStyle(btn).border
        }
      }));
      
      return result;
    });
    
    console.log('📊 Tab1（総合）の状態:');
    console.log('  アクティブタブ:', tab1Data.activeTab);
    console.log('  ヘッダー:', tab1Data.headers.join(' | '));
    console.log('\n  最初の行のデータ:');
    tab1Data.headers.forEach((header, index) => {
      const cellData = tab1Data.firstRowData[index];
      if (cellData) {
        const status = cellData.hasContent ? '✅' : '❌';
        const text = cellData.text.length > 40 ? cellData.text.substring(0, 40) + '...' : cellData.text;
        console.log(`    ${header}: ${status} ${text || '(空)'}`);
      }
    });
    
    console.log('\n  詳細を見るボタン:', tab1Data.detailButtons.length + '個');
    if (tab1Data.detailButtons.length > 0) {
      const btn = tab1Data.detailButtons[0];
      console.log(`    スタイル: 背景=${btn.styles.background}, 文字色=${btn.styles.color}`);
    }
    
    // Tab2をクリック
    console.log('\n🔄 Tab2（施術内容）をクリック...');
    await page.click('[data-tab="tab2"]');
    await page.waitForTimeout(1000);
    
    const tab2Data = await page.evaluate(() => {
      const headers = document.querySelectorAll('#comparison-table thead th');
      const firstRow = document.querySelector('#comparison-table tbody tr:first-child');
      const cells = firstRow ? firstRow.querySelectorAll('td') : [];
      
      return {
        headers: Array.from(headers).map(h => h.textContent.trim()),
        cellCount: cells.length,
        hasData: Array.from(cells).map(cell => cell.textContent.trim() !== '').filter(Boolean).length
      };
    });
    
    console.log('📊 Tab2（施術内容）の状態:');
    console.log('  ヘッダー:', tab2Data.headers.join(' | '));
    console.log('  セル数:', tab2Data.cellCount);
    console.log('  データあり:', tab2Data.hasData + '/' + tab2Data.cellCount + 'セル');
    
    // Tab3をクリック
    console.log('\n🔄 Tab3（サービス）をクリック...');
    await page.click('[data-tab="tab3"]');
    await page.waitForTimeout(1000);
    
    const tab3Data = await page.evaluate(() => {
      const headers = document.querySelectorAll('#comparison-table thead th');
      const firstRow = document.querySelector('#comparison-table tbody tr:first-child');
      const cells = firstRow ? firstRow.querySelectorAll('td') : [];
      
      return {
        headers: Array.from(headers).map(h => h.textContent.trim()),
        cellCount: cells.length,
        hasData: Array.from(cells).map(cell => cell.textContent.trim() !== '').filter(Boolean).length
      };
    });
    
    console.log('📊 Tab3（サービス）の状態:');
    console.log('  ヘッダー:', tab3Data.headers.join(' | '));
    console.log('  セル数:', tab3Data.cellCount);
    console.log('  データあり:', tab3Data.hasData + '/' + tab3Data.cellCount + 'セル');
    
    // Tab1に戻る
    console.log('\n🔄 Tab1に戻る...');
    await page.click('[data-tab="tab1"]');
    await page.waitForTimeout(1000);
    
    // 詳細を見るボタンのホバー効果をテスト
    console.log('\n🖱️ 詳細を見るボタンのホバー効果をテスト...');
    const detailButton = await page.$('.detail_btn, .cta-link.detail-scroll-link');
    if (detailButton) {
      await detailButton.hover();
      await page.waitForTimeout(500);
      
      const hoverStyle = await page.evaluate(() => {
        const btn = document.querySelector('.detail_btn, .cta-link.detail-scroll-link');
        return {
          background: window.getComputedStyle(btn).backgroundColor,
          color: window.getComputedStyle(btn).color
        };
      });
      console.log('  ホバー時のスタイル:');
      console.log('    背景色:', hoverStyle.background);
      console.log('    文字色:', hoverStyle.color);
    }
    
    // 最終スクリーンショット
    await page.screenshot({ path: 'comparison-table-final.png', fullPage: false });
    console.log('\n📸 最終状態のスクリーンショット: comparison-table-final.png');
    
    console.log('\n✨ テスト完了！');
    console.log('👀 ブラウザを10秒間開いたままにします...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 エラー時のスクリーンショット: error-screenshot.png');
  } finally {
    await browser.close();
  }
})();