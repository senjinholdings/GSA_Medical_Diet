const { chromium } = require('playwright');

(async () => {
  console.log('🔍 リダイレクトページのリンクテスト\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ ページ読み込み完了\n');
    
    // ランキングセクションのリンクを確認
    console.log('📊 ランキングセクションのリンクを確認:');
    const rankingLinks = await page.evaluate(() => {
      const rankingSection = document.querySelector('.ranking-container');
      const links = [];
      
      if (rankingSection) {
        // p.btn.btn_second_primary内のリンクを探す
        const linkElements = rankingSection.querySelectorAll('.btn_second_primary a');
        linkElements.forEach((link, index) => {
          const href = link.getAttribute('href');
          const rankingItem = link.closest('.ranking-item');
          const clinicName = rankingItem ? rankingItem.querySelector('h3')?.textContent : '';
          links.push({
            rank: index + 1,
            clinicName: clinicName?.trim(),
            href: href,
            isCorrect: href && href.includes('/go/')
          });
        });
      }
      
      return links;
    });
    
    rankingLinks.forEach(link => {
      console.log(`  ${link.rank}位: ${link.clinicName}`);
      console.log(`    URL: ${link.href}`);
      console.log(`    状態: ${link.isCorrect ? '✅ 正しいリダイレクトページ' : '❌ 誤ったURL'}`);
    });
    
    // 比較表のリンクを確認
    console.log('\n📊 比較表のリンクを確認:');
    const comparisonLinks = await page.evaluate(() => {
      const comparisonTable = document.querySelector('.comparison-table');
      const links = [];
      
      if (comparisonTable) {
        const rows = comparisonTable.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
          const linkElement = row.querySelector('a.link_btn');
          const clinicName = row.querySelector('td:nth-child(2)')?.textContent; // 2列目がクリニック名
          
          if (linkElement) {
            const href = linkElement.getAttribute('href');
            links.push({
              row: index + 1,
              clinicName: clinicName?.trim(),
              href: href,
              isCorrect: href && href.includes('/go/')
            });
          }
        });
      }
      
      return links;
    });
    
    comparisonLinks.forEach(link => {
      console.log(`  行${link.row}: ${link.clinicName}`);
      console.log(`    URL: ${link.href}`);
      console.log(`    状態: ${link.isCorrect ? '✅ 正しいリダイレクトページ' : '❌ 誤ったURL'}`);
    });
    
    // 各クリニックコードのマッピングを確認
    console.log('\n📊 クリニックコードマッピング:');
    const clinicMapping = await page.evaluate(() => {
      if (!window.dataManager) return [];
      
      const mapping = [];
      // 東京のランキングデータを取得
      const ranking = window.dataManager.getRankingByRegionId('13');
      if (ranking && ranking.ranks) {
        for (let i = 1; i <= 5; i++) {
          const clinicId = ranking.ranks[`no${i}`];
          if (clinicId && clinicId !== '-') {
            const clinic = window.dataManager.getClinicById(clinicId);
            const code = window.dataManager.getClinicCodeById(clinicId);
            if (clinic && code) {
              mapping.push({
                rank: i,
                id: clinicId,
                name: clinic.name,
                code: code
              });
            }
          }
        }
      }
      return mapping;
    });
    
    clinicMapping.forEach(item => {
      console.log(`  ${item.rank}位: ${item.name} → /go/${item.code}/`);
    });
    
    // 実際にリンクをクリックして確認（最初のリンクのみ）
    if (rankingLinks.length > 0 && rankingLinks[0].isCorrect) {
      console.log('\n🖱️ 1位のリンクをクリックしてテスト...');
      const firstLinkSelector = '.ranking-container .ranking-item:first-child .btn_second_primary a';
      
      // 新しいタブで開く
      const [newPage] = await Promise.all([
        page.waitForEvent('popup'),
        page.click(firstLinkSelector)
      ]);
      
      await newPage.waitForTimeout(2000);
      
      const newUrl = newPage.url();
      console.log(`  新しいタブのURL: ${newUrl}`);
      console.log(`  状態: ${newUrl.includes('/go/') ? '✅ リダイレクトページが開いた' : '❌ 誤ったページ'}`);
      
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