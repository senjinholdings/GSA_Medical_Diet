const { chromium } = require('playwright');

(async () => {
  console.log('🔍 全クリニックのリンクと注意事項をテスト\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    // コンソールエラーをキャプチャ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ ページ読み込み完了\n');
    
    // 1. ランキングセクションのリンクをチェック
    console.log('📊 ランキングセクションのリンク:');
    const rankingLinks = await page.evaluate(() => {
      const links = [];
      const buttons = document.querySelectorAll('.ranking-container .btn_second_primary a');
      buttons.forEach((link, index) => {
        const href = link.getAttribute('href');
        const clinicCard = link.closest('.clinic-card');
        const clinicName = clinicCard ? clinicCard.querySelector('h3')?.textContent : '';
        links.push({
          rank: index + 1,
          clinic: clinicName,
          href: href
        });
      });
      return links;
    });
    
    rankingLinks.forEach(link => {
      console.log(`  ${link.rank}位: ${link.clinic}`);
      console.log(`    URL: ${link.href}`);
      // redirect.htmlのパラメータを解析
      if (link.href) {
        const url = new URL(link.href, 'http://localhost:3000');
        const clinicId = url.searchParams.get('clinic_id');
        const rank = url.searchParams.get('rank');
        console.log(`    → clinic_id=${clinicId}, rank=${rank}`);
      }
    });
    
    // 2. 比較表のリンクをチェック
    console.log('\n📊 比較表のリンク:');
    const comparisonLinks = await page.evaluate(() => {
      const links = [];
      const buttons = document.querySelectorAll('.comparison-table tbody .link_btn');
      buttons.forEach((link, index) => {
        const href = link.getAttribute('href');
        const row = link.closest('tr');
        const clinicName = row ? row.querySelector('td:nth-child(2)')?.textContent : '';
        links.push({
          row: index + 1,
          clinic: clinicName,
          href: href
        });
      });
      return links;
    });
    
    comparisonLinks.forEach(link => {
      console.log(`  行${link.row}: ${link.clinic}`);
      console.log(`    URL: ${link.href}`);
      if (link.href) {
        const url = new URL(link.href, 'http://localhost:3000');
        const clinicId = url.searchParams.get('clinic_id');
        const rank = url.searchParams.get('rank');
        console.log(`    → clinic_id=${clinicId}, rank=${rank}`);
      }
    });
    
    // 3. 注意事項のアコーディオンをテスト
    console.log('\n📊 注意事項アコーディオンのテスト:');
    
    // 比較表までスクロール
    await page.evaluate(() => {
      const section = document.querySelector('.comparison-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);
    
    // メインアコーディオンを開く
    console.log('  1. メインアコーディオンをクリック');
    const mainButton = await page.$('.comparison-section .main-disclaimer-header');
    if (mainButton) {
      await mainButton.click();
      await page.waitForTimeout(500);
      
      const mainContent = await page.evaluate(() => {
        const content = document.getElementById('main-content');
        return {
          display: content ? window.getComputedStyle(content).display : null,
          childCount: content ? content.children.length : 0
        };
      });
      console.log(`     → display: ${mainContent.display}, 子要素: ${mainContent.childCount}個`);
      
      // 個別クリニックのボタンを確認
      const individualButtons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('#main-content .disclaimer-header');
        return Array.from(buttons).map(btn => {
          const clinicName = btn.querySelector('span')?.textContent?.trim();
          const onclick = btn.getAttribute('onclick');
          return { clinic: clinicName, onclick: onclick };
        });
      });
      
      console.log('\n  2. 個別クリニックボタン:');
      individualButtons.forEach((btn, i) => {
        console.log(`     ${i + 1}. ${btn.clinic} - ${btn.onclick}`);
      });
      
      // 最初の個別ボタンをクリック
      if (individualButtons.length > 0) {
        console.log('\n  3. 最初の個別クリニックをクリック');
        const firstButton = await page.$('#main-content .disclaimer-header');
        if (firstButton) {
          await firstButton.click();
          await page.waitForTimeout(500);
          
          const firstContent = await page.evaluate(() => {
            const content = document.querySelector('#main-content .disclaimer-content');
            return {
              display: content ? window.getComputedStyle(content).display : null,
              text: content ? content.textContent.substring(0, 50) : ''
            };
          });
          console.log(`     → display: ${firstContent.display}`);
          if (firstContent.text) {
            console.log(`     → 内容: ${firstContent.text}...`);
          }
        }
      }
    }
    
    // 4. リダイレクトページの動作確認
    console.log('\n📊 リダイレクトページの動作確認:');
    console.log('  1位のリンクをクリック...');
    
    const firstLink = await page.$('.ranking-container .btn_second_primary a');
    if (firstLink) {
      const href = await firstLink.getAttribute('href');
      console.log(`  クリック前のURL: ${href}`);
      
      // 新しいタブで開く
      const [newPage] = await Promise.all([
        page.waitForEvent('popup'),
        firstLink.click()
      ]);
      
      await newPage.waitForTimeout(3000);
      
      const redirectedUrl = newPage.url();
      console.log(`  リダイレクト後のURL: ${redirectedUrl}`);
      
      // リダイレクト先を判定
      if (redirectedUrl.includes('ohmyteeth') || redirectedUrl.includes('a8.net')) {
        console.log('  → Oh my teethにリダイレクトされました');
      } else if (redirectedUrl.includes('kireiline') || redirectedUrl.includes('affiliate-b')) {
        console.log('  → キレイライン矯正にリダイレクトされました');
      } else if (redirectedUrl.includes('wi-smile')) {
        console.log('  → ウィスマイルにリダイレクトされました');
      } else if (redirectedUrl.includes('zenyum')) {
        console.log('  → ゼニュムにリダイレクトされました');
      } else {
        console.log('  → 不明なリダイレクト先');
      }
      
      await newPage.close();
    }
    
    console.log('\n👀 ブラウザを5秒間開いたままにします...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();