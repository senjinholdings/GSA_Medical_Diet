const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Checking for 詳細を見る buttons...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.text().includes('setupComparisonTabs') || msg.text().includes('regenerateTableForTab')) {
      console.log('Browser:', msg.text());
    }
  });
  
  try {
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#comparison-table', { timeout: 10000 });

    console.log('✅ Page loaded\n');
    
    // Wait for table generation
    await page.waitForTimeout(2000);

    // Check all links in the comparison table
    const allLinks = await page.evaluate(() => {
      const tbody = document.getElementById('comparison-tbody');
      if (!tbody) return { error: 'No tbody found' };
      
      const links = tbody.querySelectorAll('a');
      const linkData = [];
      
      links.forEach(link => {
        linkData.push({
          text: link.textContent.trim(),
          href: link.href,
          className: link.className,
          parentTag: link.parentElement.tagName
        });
      });
      
      return {
        totalLinks: links.length,
        links: linkData,
        totalRows: tbody.querySelectorAll('tr').length,
        totalCells: tbody.querySelectorAll('td').length
      };
    });
    
    console.log('📊 Table Analysis:');
    console.log('  Total Rows:', allLinks.totalRows);
    console.log('  Total Cells:', allLinks.totalCells);
    console.log('  Total Links:', allLinks.totalLinks);
    
    console.log('\n📋 All Links in Table:');
    allLinks.links.forEach((link, index) => {
      console.log(`  ${index + 1}. "${link.text}" - Class: ${link.className}`);
    });
    
    // Check specifically for detail-scroll-link
    const detailButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.detail-scroll-link');
      return {
        count: buttons.length,
        locations: Array.from(buttons).map(btn => ({
          text: btn.textContent.trim(),
          isInTable: btn.closest('#comparison-table') !== null,
          parentId: btn.closest('[id]')?.id || 'no-id'
        }))
      };
    });
    
    console.log('\n🔍 Detail Scroll Links:');
    console.log('  Count:', detailButtons.count);
    if (detailButtons.count > 0) {
      detailButtons.locations.forEach(loc => {
        console.log(`    - "${loc.text}" in ${loc.parentId} (in table: ${loc.isInTable})`);
      });
    }
    
    // Check the HTML of the last cell in first row (where detail button should be)
    const lastCellHtml = await page.evaluate(() => {
      const firstRow = document.querySelector('#comparison-tbody tr:first-child');
      if (!firstRow) return 'No first row';
      
      const cells = firstRow.querySelectorAll('td');
      const lastCell = cells[cells.length - 1];
      return lastCell ? lastCell.innerHTML : 'No last cell';
    });
    
    console.log('\n📝 Last Cell HTML:');
    console.log(lastCellHtml);
    
  } catch (error) {
    console.error('❌ Error occurred:', error);
  } finally {
    await browser.close();
  }
})();