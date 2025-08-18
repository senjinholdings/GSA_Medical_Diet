const { chromium } = require('playwright');

(async () => {
  console.log('🔍 注意事項のHTML構造を確認\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 比較表までスクロール
    await page.evaluate(() => {
      const section = document.querySelector('.comparison-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);
    
    // メインアコーディオンをクリック
    console.log('📊 メインアコーディオンをクリック...');
    await page.click('.comparison-section .main-disclaimer-header');
    await page.waitForTimeout(500);
    
    // HTMLの構造を確認
    const disclaimerStructure = await page.evaluate(() => {
      const mainContent = document.getElementById('main-content');
      if (!mainContent) return null;
      
      // 各クリニックのボタンを確認
      const buttons = mainContent.querySelectorAll('.disclaimer-header');
      const buttonsInfo = Array.from(buttons).map(btn => {
        const rect = btn.getBoundingClientRect();
        const computed = window.getComputedStyle(btn);
        const parent = btn.parentElement;
        const parentComputed = parent ? window.getComputedStyle(parent) : null;
        
        return {
          text: btn.textContent.trim(),
          onclick: btn.getAttribute('onclick'),
          visible: rect.width > 0 && rect.height > 0,
          display: computed.display,
          visibility: computed.visibility,
          position: computed.position,
          parentDisplay: parentComputed ? parentComputed.display : null,
          parentVisibility: parentComputed ? parentComputed.visibility : null,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        };
      });
      
      // コンテンツを確認
      const contents = mainContent.querySelectorAll('.disclaimer-content');
      const contentsInfo = Array.from(contents).map(content => {
        const id = content.id;
        const computed = window.getComputedStyle(content);
        return {
          id: id,
          display: computed.display,
          textLength: content.textContent.length
        };
      });
      
      return {
        mainContentDisplay: window.getComputedStyle(mainContent).display,
        buttons: buttonsInfo,
        contents: contentsInfo,
        innerHTML: mainContent.innerHTML.substring(0, 500)
      };
    });
    
    console.log('📋 HTML構造:');
    console.log('  メインコンテンツ表示:', disclaimerStructure.mainContentDisplay);
    console.log('\n  ボタン情報:');
    disclaimerStructure.buttons.forEach((btn, i) => {
      console.log(`    ${i + 1}. ${btn.text}`);
      console.log(`       onclick: ${btn.onclick}`);
      console.log(`       visible: ${btn.visible}`);
      console.log(`       display: ${btn.display}`);
      console.log(`       visibility: ${btn.visibility}`);
      console.log(`       parentDisplay: ${btn.parentDisplay}`);
      console.log(`       rect: ${JSON.stringify(btn.rect)}`);
    });
    
    console.log('\n  コンテンツ情報:');
    disclaimerStructure.contents.forEach((content, i) => {
      console.log(`    ${i + 1}. ${content.id}`);
      console.log(`       display: ${content.display}`);
      console.log(`       textLength: ${content.textLength}`);
    });
    
    // JavaScriptで直接クリックを試みる
    console.log('\n🖱️ JavaScriptで直接クリックを試みる...');
    const result = await page.evaluate(() => {
      const firstButton = document.querySelector('#main-content .disclaimer-header');
      if (firstButton) {
        const clinicSlug = firstButton.getAttribute('onclick').match(/toggleDisclaimer\('(.+?)'\)/)?.[1];
        if (clinicSlug) {
          // toggleDisclaimer関数を直接呼び出し
          if (typeof window.toggleDisclaimer === 'function') {
            window.toggleDisclaimer(clinicSlug);
            
            // 結果を確認
            const content = document.getElementById(`${clinicSlug}-content`);
            return {
              success: true,
              clinicSlug: clinicSlug,
              contentDisplay: content ? window.getComputedStyle(content).display : null
            };
          } else {
            return { success: false, error: 'toggleDisclaimer関数が見つかりません' };
          }
        }
      }
      return { success: false, error: 'ボタンが見つかりません' };
    });
    
    console.log('  結果:', result);
    
    console.log('\n👀 ブラウザを10秒間開いたままにします...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();