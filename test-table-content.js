const { chromium } = require('playwright');

(async () => {
  console.log('🔍 比較表の内容確認テスト\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ ページ読み込み完了\n');
    
    // 比較表までスクロール
    await page.evaluate(() => {
      const section = document.querySelector('.comparison-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);
    
    // テーブル内容を確認
    console.log('📊 比較表の内容:');
    const tableData = await page.evaluate(() => {
      const tbody = document.getElementById('comparison-tbody');
      if (!tbody) return null;
      
      const rows = [];
      Array.from(tbody.querySelectorAll('tr')).forEach((tr, rowIndex) => {
        const cells = [];
        Array.from(tr.querySelectorAll('td')).forEach((td, cellIndex) => {
          // セルの内容を取得
          let content = '';
          
          // ロゴがある場合
          const logo = td.querySelector('.clinic_logo');
          if (logo) {
            content = `LOGO:${logo.alt || 'no-alt'}`;
          }
          // リンクボタンがある場合
          else if (td.querySelector('.link_btn')) {
            content = 'LINK_BTN';
          }
          // 詳細ボタンがある場合
          else if (td.querySelector('.detail_btn')) {
            content = 'DETAIL_BTN';
          }
          // 星評価がある場合
          else if (td.querySelector('.star-rating')) {
            const stars = td.querySelectorAll('.star-rating .star.filled').length;
            content = `STARS:${stars}`;
          }
          // 通常のテキスト
          else {
            content = td.textContent.trim().substring(0, 30);
          }
          
          cells.push({
            index: cellIndex,
            content: content,
            className: td.className,
            hasInnerHTML: td.innerHTML.length > 0
          });
        });
        
        rows.push({
          index: rowIndex,
          cells: cells
        });
      });
      
      return rows;
    });
    
    if (tableData) {
      tableData.forEach(row => {
        console.log(`\n  行${row.index + 1}:`);
        row.cells.forEach(cell => {
          console.log(`    セル${cell.index + 1}: ${cell.content} (HTML有: ${cell.hasInnerHTML})`);
        });
      });
    } else {
      console.log('  テーブルデータが見つかりません');
    }
    
    // タブ切り替えテスト
    console.log('\n📊 タブ切り替えテスト:');
    
    // Tab2をクリック
    const tab2 = await page.$('[data-tab="tab2"]');
    if (tab2) {
      await tab2.click();
      await page.waitForTimeout(1000);
      
      const tab2Headers = await page.evaluate(() => {
        const headerRow = document.getElementById('comparison-header-row');
        return headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent) : [];
      });
      
      console.log('  Tab2のヘッダー:', tab2Headers.join(', '));
    }
    
    // Tab3をクリック
    const tab3 = await page.$('[data-tab="tab3"]');
    if (tab3) {
      await tab3.click();
      await page.waitForTimeout(1000);
      
      const tab3Headers = await page.evaluate(() => {
        const headerRow = document.getElementById('comparison-header-row');
        return headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent) : [];
      });
      
      console.log('  Tab3のヘッダー:', tab3Headers.join(', '));
    }
    
    // Tab1に戻る
    const tab1 = await page.$('[data-tab="tab1"]');
    if (tab1) {
      await tab1.click();
      await page.waitForTimeout(1000);
      
      const tab1Headers = await page.evaluate(() => {
        const headerRow = document.getElementById('comparison-header-row');
        return headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent) : [];
      });
      
      console.log('  Tab1のヘッダー:', tab1Headers.join(', '));
    }
    
    console.log('\n👀 ブラウザを10秒間開いたままにします...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();