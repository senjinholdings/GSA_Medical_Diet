const { chromium, devices } = require('playwright');

(async () => {
  console.log('🔍 CSSの適用順序を確認\n');
  
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
    
    // mouthpiece002
    const context2 = await browser.newContext(iPhone);
    const page2 = await context2.newPage();
    await page2.goto('http://localhost:3000/mouthpiece002/');
    await page2.waitForLoadState('networkidle');
    await page2.waitForSelector('.comparison-table', { timeout: 10000 });
    
    // 施術内容タブをクリック
    await page2.click('[data-tab="tab2"]');
    await page2.waitForTimeout(1000);
    
    // CSSの計算値を取得
    const injectionCSS = await page1.evaluate(() => {
      const btn = document.querySelector('.comparison-table .detail_btn');
      if (btn) {
        const styles = window.getComputedStyle(btn);
        return {
          padding: styles.padding,
          fontSize: styles.fontSize,
          background: styles.backgroundColor,
          color: styles.color,
          border: styles.border,
          borderRadius: styles.borderRadius,
          boxSizing: styles.boxSizing,
          maxWidth: styles.maxWidth
        };
      }
      return null;
    });
    
    const mouthpieceCSS = await page2.evaluate(() => {
      const btn = document.querySelector('.comparison-table .detail_btn');
      if (btn) {
        const styles = window.getComputedStyle(btn);
        return {
          padding: styles.padding,
          fontSize: styles.fontSize,
          background: styles.backgroundColor,
          color: styles.color,
          border: styles.border,
          borderRadius: styles.borderRadius,
          boxSizing: styles.boxSizing,
          maxWidth: styles.maxWidth
        };
      }
      return null;
    });
    
    console.log('📊 詳細をみるボタンのCSS比較:\n');
    
    console.log('injection-lipolysis001:');
    if (injectionCSS) {
      Object.entries(injectionCSS).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
    
    console.log('\nmouthpiece002:');
    if (mouthpieceCSS) {
      Object.entries(mouthpieceCSS).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
    
    // 違いを検出
    console.log('\n📊 違い:');
    if (injectionCSS && mouthpieceCSS) {
      let hasDifference = false;
      Object.keys(injectionCSS).forEach(key => {
        if (injectionCSS[key] !== mouthpieceCSS[key]) {
          console.log(`  ${key}: "${injectionCSS[key]}" vs "${mouthpieceCSS[key]}"`);
          hasDifference = true;
        }
      });
      
      if (!hasDifference) {
        console.log('  ✅ 全てのスタイルが一致しています！');
      }
    }
    
    // スクリーンショット
    await page1.screenshot({ path: 'injection-css-order.png', fullPage: false });
    await page2.screenshot({ path: 'mouthpiece-css-order.png', fullPage: false });
    
    console.log('\n📸 スクリーンショット保存');
    console.log('\n👀 ブラウザを10秒間開いたままにします...');
    await page1.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();