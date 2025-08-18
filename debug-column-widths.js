const { chromium } = require('playwright');

async function debugColumnWidths() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    const page = await browser.newPage();
    page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('🔍 Debugging column widths...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    
    // Scroll to table
    await page.evaluate(() => {
        const table = document.querySelector('#comparison-table');
        if (table) table.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(1000);
    
    // Click on tab1 (総合)
    await page.click('.comparison-tab-menu-item[data-tab="tab1"]', { force: true });
    await page.waitForTimeout(500);
    
    // Get detailed column info
    const columnInfo = await page.evaluate(() => {
        const headers = document.querySelectorAll('#comparison-header-row th');
        const tbody = document.querySelector('#comparison-tbody');
        const firstRow = tbody ? tbody.querySelector('tr') : null;
        const cells = firstRow ? firstRow.querySelectorAll('td') : [];
        
        const result = {
            tableWidth: document.querySelector('#comparison-table').offsetWidth,
            headers: [],
            cells: []
        };
        
        headers.forEach((th, index) => {
            const style = window.getComputedStyle(th);
            const rect = th.getBoundingClientRect();
            result.headers.push({
                index,
                text: th.textContent.trim(),
                display: style.display,
                visibility: style.visibility,
                width: th.offsetWidth,
                computedWidth: style.width,
                left: th.offsetLeft,
                rectLeft: rect.left,
                rectRight: rect.right,
                padding: style.padding,
                hasClass: th.className,
                hasStyle: th.getAttribute('style')
            });
        });
        
        cells.forEach((td, index) => {
            const style = window.getComputedStyle(td);
            const rect = td.getBoundingClientRect();
            result.cells.push({
                index,
                display: style.display,
                visibility: style.visibility,
                width: td.offsetWidth,
                computedWidth: style.width,
                left: td.offsetLeft,
                rectLeft: rect.left,
                rectRight: rect.right,
                hasClass: td.className,
                hasStyle: td.getAttribute('style')
            });
        });
        
        return result;
    });
    
    console.log(`Table width: ${columnInfo.tableWidth}px\n`);
    
    console.log('Headers:');
    columnInfo.headers.forEach(h => {
        if (h.display !== 'none') {
            console.log(`  [${h.index}] "${h.text}"`);
            console.log(`      Display: ${h.display}, Width: ${h.width}px (computed: ${h.computedWidth})`);
            console.log(`      Left: ${h.left}px, Rect: ${h.rectLeft} - ${h.rectRight}`);
            console.log(`      Class: "${h.hasClass}", Style: "${h.hasStyle}"`);
        }
    });
    
    console.log('\nCells:');
    columnInfo.cells.forEach((c, i) => {
        if (c.display !== 'none' && i < 5) {
            console.log(`  [${c.index}]`);
            console.log(`      Display: ${c.display}, Width: ${c.width}px (computed: ${c.computedWidth})`);
            console.log(`      Left: ${c.left}px, Rect: ${c.rectLeft} - ${c.rectRight}`);
        }
    });
    
    // Check for overlaps
    console.log('\nOverlap Analysis:');
    const visibleHeaders = columnInfo.headers.filter(h => h.display !== 'none');
    for (let i = 0; i < visibleHeaders.length - 1; i++) {
        const current = visibleHeaders[i];
        const next = visibleHeaders[i + 1];
        const overlap = current.rectRight - next.rectLeft;
        if (overlap > 0.1) {
            console.log(`  ⚠️ Column ${current.index} overlaps with ${next.index} by ${overlap.toFixed(2)}px`);
            console.log(`     ${current.text}: ends at ${current.rectRight.toFixed(2)}`);
            console.log(`     ${next.text}: starts at ${next.rectLeft.toFixed(2)}`);
        }
    }
    
    await page.waitForTimeout(30000);
    await browser.close();
}

debugColumnWidths();