const { chromium, devices } = require('playwright');

(async () => {
  console.log('🔍 スマホ版の公式サイトボタン構造を比較\n');
  
  const browser = await chromium.launch({ headless: false });
  const iPhone = devices['iPhone 12'];
  
  try {
    // injection-lipolysis001のページを開く
    const context1 = await browser.newContext(iPhone);
    const page1 = await context1.newPage();
    await page1.goto('http://localhost:3000/injection-lipolysis001/?comparison_tab=%E6%96%BD%E8%A1%93%E5%86%85%E5%AE%B9&max_scroll=25');
    await page1.waitForLoadState('networkidle');
    await page1.waitForSelector('.comparison-table', { timeout: 10000 });
    
    console.log('✅ injection-lipolysis001 読み込み完了');
    
    // injection-lipolysis001のHTML構造を取得
    const injectionHTML = await page1.evaluate(() => {
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
    
    // mouthpiece002のページを開く
    const context2 = await browser.newContext(iPhone);
    const page2 = await context2.newPage();
    await page2.goto('http://localhost:3000/mouthpiece002/?comparison_tab=%E6%96%BD%E8%A1%93%E5%86%85%E5%AE%B9&max_scroll=25');
    await page2.waitForLoadState('networkidle');
    await page2.waitForSelector('.comparison-table', { timeout: 10000 });
    
    console.log('✅ mouthpiece002 読み込み完了\n');
    
    // mouthpiece002のHTML構造を取得
    const mouthpieceHTML = await page2.evaluate(() => {
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
    
    // スクリーンショットを撮る
    await page1.screenshot({ path: 'injection-mobile-buttons.png', fullPage: false });
    await page2.screenshot({ path: 'mouthpiece-mobile-buttons.png', fullPage: false });
    
    console.log('📸 スクリーンショット保存:\n  - injection-mobile-buttons.png\n  - mouthpiece-mobile-buttons.png\n');
    
    // HTML構造の比較
    console.log('🎨 公式サイト列のHTML構造比較:\n');
    
    console.log('injection-lipolysis001:');
    if (injectionHTML) {
      console.log('  ボタン数:', injectionHTML.buttons.length);
      injectionHTML.buttons.forEach((btn, index) => {
        console.log(`  ボタン${index + 1}: "${btn.text}" (class: ${btn.className})`);
      });
      console.log('\n  HTML構造:');
      console.log('  ' + injectionHTML.html.replace(/\n/g, '\n  ').substring(0, 500) + '...\n');
    }
    
    console.log('mouthpiece002:');
    if (mouthpieceHTML) {
      console.log('  ボタン数:', mouthpieceHTML.buttons.length);
      mouthpieceHTML.buttons.forEach((btn, index) => {
        console.log(`  ボタン${index + 1}: "${btn.text}" (class: ${btn.className})`);
      });
      console.log('\n  HTML構造:');
      console.log('  ' + mouthpieceHTML.html.replace(/\n/g, '\n  ').substring(0, 500) + '...\n');
    }
    
    // 違いの検出
    console.log('📊 構造の違い:');
    if (injectionHTML && mouthpieceHTML) {
      const diff = [];
      
      if (injectionHTML.buttons.length !== mouthpieceHTML.buttons.length) {
        diff.push(`ボタン数: injection=${injectionHTML.buttons.length} vs mouthpiece=${mouthpieceHTML.buttons.length}`);
      }
      
      if (injectionHTML.buttons[0] && mouthpieceHTML.buttons[0]) {
        if (injectionHTML.buttons[0].className !== mouthpieceHTML.buttons[0].className) {
          diff.push(`最初のボタンのクラス: injection="${injectionHTML.buttons[0].className}" vs mouthpiece="${mouthpieceHTML.buttons[0].className}"`);
        }
      }
      
      if (diff.length > 0) {
        diff.forEach(d => console.log('  - ' + d));
      } else {
        console.log('  ✅ 構造は一致しています');
      }
    }
    
    console.log('\n👀 ブラウザを10秒間開いたままにします...');
    await page1.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();