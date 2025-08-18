const { chromium } = require('playwright');

(async () => {
  console.log('🔍 詳細を見るボタンのデザイン比較テスト\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    // injection-lipolysis001のページを開く
    const page1 = await browser.newPage();
    await page1.goto('http://localhost:3000/injection-lipolysis001/?comparison_tab=%E6%96%BD%E8%A1%93%E5%86%85%E5%AE%B9&max_scroll=25');
    await page1.waitForLoadState('networkidle');
    await page1.waitForSelector('.comparison-table', { timeout: 10000 });
    
    console.log('✅ injection-lipolysis001 読み込み完了');
    
    // injection-lipolysis001のボタンスタイルを取得
    const injection = await page1.evaluate(() => {
      const buttons = document.querySelectorAll('.comparison-table .cta-link.detail-scroll-link, .comparison-table .detail_btn');
      return Array.from(buttons).map(btn => {
        const styles = window.getComputedStyle(btn);
        return {
          text: btn.textContent.trim(),
          className: btn.className,
          styles: {
            background: styles.backgroundColor,
            color: styles.color,
            border: styles.border,
            borderRadius: styles.borderRadius,
            padding: styles.padding,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            textDecoration: styles.textDecoration,
            display: styles.display
          }
        };
      });
    });
    
    // mouthpiece002のページを開く
    const page2 = await browser.newPage();
    await page2.goto('http://localhost:3000/mouthpiece002/?comparison_tab=%E6%96%BD%E8%A1%93%E5%86%85%E5%AE%B9&max_scroll=25');
    await page2.waitForLoadState('networkidle');
    await page2.waitForSelector('.comparison-table', { timeout: 10000 });
    
    console.log('✅ mouthpiece002 読み込み完了\n');
    
    // mouthpiece002のボタンスタイルを取得
    const mouthpiece = await page2.evaluate(() => {
      const buttons = document.querySelectorAll('.comparison-table .cta-link.detail-scroll-link, .comparison-table .detail_btn');
      return Array.from(buttons).map(btn => {
        const styles = window.getComputedStyle(btn);
        return {
          text: btn.textContent.trim(),
          className: btn.className,
          styles: {
            background: styles.backgroundColor,
            color: styles.color,
            border: styles.border,
            borderRadius: styles.borderRadius,
            padding: styles.padding,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            textDecoration: styles.textDecoration,
            display: styles.display
          }
        };
      });
    });
    
    // スクリーンショットを撮る
    await page1.screenshot({ path: 'injection-button.png', clip: { x: 0, y: 200, width: 1200, height: 600 } });
    await page2.screenshot({ path: 'mouthpiece-button.png', clip: { x: 0, y: 200, width: 1200, height: 600 } });
    
    console.log('📸 スクリーンショット保存:\n  - injection-button.png\n  - mouthpiece-button.png\n');
    
    // ボタンスタイルの比較
    console.log('🎨 詳細を見るボタンのスタイル比較:\n');
    console.log('injection-lipolysis001:');
    if (injection.length > 0) {
      const btn = injection[0];
      console.log(`  ボタン数: ${injection.length}個`);
      console.log(`  テキスト: "${btn.text}"`);
      console.log(`  クラス: ${btn.className}`);
      console.log(`  背景色: ${btn.styles.background}`);
      console.log(`  文字色: ${btn.styles.color}`);
      console.log(`  ボーダー: ${btn.styles.border}`);
      console.log(`  角丸: ${btn.styles.borderRadius}`);
      console.log(`  パディング: ${btn.styles.padding}`);
      console.log(`  フォントサイズ: ${btn.styles.fontSize}`);
    } else {
      console.log('  ❌ ボタンが見つかりません');
    }
    
    console.log('\nmouthpiece002:');
    if (mouthpiece.length > 0) {
      const btn = mouthpiece[0];
      console.log(`  ボタン数: ${mouthpiece.length}個`);
      console.log(`  テキスト: "${btn.text}"`);
      console.log(`  クラス: ${btn.className}`);
      console.log(`  背景色: ${btn.styles.background}`);
      console.log(`  文字色: ${btn.styles.color}`);
      console.log(`  ボーダー: ${btn.styles.border}`);
      console.log(`  角丸: ${btn.styles.borderRadius}`);
      console.log(`  パディング: ${btn.styles.padding}`);
      console.log(`  フォントサイズ: ${btn.styles.fontSize}`);
    } else {
      console.log('  ❌ ボタンが見つかりません');
    }
    
    // 違いを検出
    console.log('\n📊 スタイルの違い:');
    if (injection.length > 0 && mouthpiece.length > 0) {
      const inj = injection[0].styles;
      const mou = mouthpiece[0].styles;
      
      let hasDifference = false;
      for (const key in inj) {
        if (inj[key] !== mou[key]) {
          console.log(`  ${key}: injection="${inj[key]}" vs mouthpiece="${mou[key]}"`);
          hasDifference = true;
        }
      }
      
      if (!hasDifference) {
        console.log('  ✅ スタイルは完全に一致しています！');
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