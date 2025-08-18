const { chromium, devices } = require('playwright');

(async () => {
  console.log('🔍 スマホ版の最終確認\n');
  
  const browser = await chromium.launch({ headless: false });
  const iPhone = devices['iPhone 12'];
  
  try {
    // injection-lipolysis001
    const context1 = await browser.newContext(iPhone);
    const page1 = await context1.newPage();
    await page1.goto('http://localhost:3000/injection-lipolysis001/');
    await page1.waitForLoadState('networkidle');
    await page1.waitForSelector('.comparison-table', { timeout: 10000 });
    
    // 施術内容タブをクリック
    await page1.click('[data-tab="tab2"]');
    await page1.waitForTimeout(1000);
    
    console.log('✅ injection-lipolysis001 - 施術内容タブ表示');
    
    // mouthpiece002
    const context2 = await browser.newContext(iPhone);
    const page2 = await context2.newPage();
    await page2.goto('http://localhost:3000/mouthpiece002/');
    await page2.waitForLoadState('networkidle');
    await page2.waitForSelector('.comparison-table', { timeout: 10000 });
    
    // 施術内容タブをクリック
    await page2.click('[data-tab="tab2"]');
    await page2.waitForTimeout(1000);
    
    console.log('✅ mouthpiece002 - 施術内容タブ表示\n');
    
    // 両方のページの公式サイト列を比較
    const injection = await page1.evaluate(() => {
      const rows = document.querySelectorAll('.comparison-table tbody tr');
      return Array.from(rows).slice(0, 2).map(row => {
        const lastCell = row.querySelector('td:last-child');
        if (lastCell) {
          const buttons = Array.from(lastCell.querySelectorAll('a'));
          return {
            buttons: buttons.map(btn => ({
              text: btn.textContent.trim(),
              className: btn.className,
              styles: {
                background: window.getComputedStyle(btn).backgroundColor,
                color: window.getComputedStyle(btn).color,
                padding: window.getComputedStyle(btn).padding,
                fontSize: window.getComputedStyle(btn).fontSize
              }
            }))
          };
        }
        return null;
      });
    });
    
    const mouthpiece = await page2.evaluate(() => {
      const rows = document.querySelectorAll('.comparison-table tbody tr');
      return Array.from(rows).slice(0, 2).map(row => {
        const lastCell = row.querySelector('td:last-child');
        if (lastCell) {
          const buttons = Array.from(lastCell.querySelectorAll('a'));
          return {
            buttons: buttons.map(btn => ({
              text: btn.textContent.trim(),
              className: btn.className,
              styles: {
                background: window.getComputedStyle(btn).backgroundColor,
                color: window.getComputedStyle(btn).color,
                padding: window.getComputedStyle(btn).padding,
                fontSize: window.getComputedStyle(btn).fontSize
              }
            }))
          };
        }
        return null;
      });
    });
    
    // スクリーンショット
    await page1.screenshot({ path: 'injection-mobile-final.png', fullPage: false });
    await page2.screenshot({ path: 'mouthpiece-mobile-final.png', fullPage: false });
    
    console.log('📸 スクリーンショット保存:\n  - injection-mobile-final.png\n  - mouthpiece-mobile-final.png\n');
    
    // 比較結果
    console.log('📊 ボタン構造の比較:\n');
    
    console.log('1行目の比較:');
    if (injection[0] && mouthpiece[0]) {
      console.log('  injection-lipolysis001:');
      injection[0].buttons.forEach((btn, i) => {
        console.log(`    ボタン${i+1}: "${btn.text}"`);
        console.log(`      背景: ${btn.styles.background}, 文字: ${btn.styles.color}`);
      });
      
      console.log('  mouthpiece002:');
      mouthpiece[0].buttons.forEach((btn, i) => {
        console.log(`    ボタン${i+1}: "${btn.text}"`);
        console.log(`      背景: ${btn.styles.background}, 文字: ${btn.styles.color}`);
      });
      
      // 比較
      const match1 = injection[0].buttons.length === mouthpiece[0].buttons.length;
      const match2 = injection[0].buttons[0]?.text === mouthpiece[0].buttons[0]?.text;
      const match3 = injection[0].buttons[1]?.text === mouthpiece[0].buttons[1]?.text;
      
      console.log('\n  結果:');
      console.log(`    ボタン数: ${match1 ? '✅ 一致' : '❌ 不一致'}`);
      console.log(`    公式サイトボタン: ${match2 ? '✅ 一致' : '❌ 不一致'}`);
      console.log(`    詳細ボタン: ${match3 ? '✅ 一致' : '❌ 不一致'}`);
      
      if (match1 && match2 && match3) {
        console.log('\n✨ スマホ版のボタン表示が完全に一致しています！');
      }
    }
    
    console.log('\n👀 ブラウザを15秒間開いたままにします...');
    await page1.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();