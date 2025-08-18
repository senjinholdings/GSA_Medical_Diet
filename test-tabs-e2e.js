const { chromium } = require('playwright');

async function testComparisonTabs() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 300
    });
    
    const page = await browser.newPage();
    
    console.log('🚀 Starting comparison table tab test...\n');
    
    try {
        await page.goto('http://localhost:8081/mouthpiece002/index.html');
        await page.waitForLoadState('networkidle');
        console.log('✓ Page loaded');
        
        // Wait for comparison table
        await page.waitForSelector('#comparison-tbody', { timeout: 5000 });
        console.log('✓ Comparison table found');
        
        // Get tab buttons
        const tabButtons = await page.$$('.comparison-tab-menu-item');
        console.log(`✓ Found ${tabButtons.length} tab buttons\n`);
        
        // Test each tab
        for (let i = 0; i < tabButtons.length; i++) {
            const tabText = await tabButtons[i].textContent();
            console.log(`\n📋 Testing tab: "${tabText.trim()}"`);
            
            // Click the tab
            await tabButtons[i].click();
            await page.waitForTimeout(500);
            
            // Check visible columns
            const visibleColumns = await page.evaluate(() => {
                const headers = document.querySelectorAll('#comparison-header-row th');
                const tbody = document.querySelector('#comparison-tbody');
                const firstRow = tbody ? tbody.querySelector('tr') : null;
                
                const result = {
                    headers: [],
                    cells: []
                };
                
                // Check headers
                headers.forEach((th, index) => {
                    const style = window.getComputedStyle(th);
                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                        result.headers.push({
                            index,
                            text: th.textContent.trim(),
                            width: th.offsetWidth
                        });
                    }
                });
                
                // Check first row cells
                if (firstRow) {
                    const cells = firstRow.querySelectorAll('td');
                    cells.forEach((td, index) => {
                        const style = window.getComputedStyle(td);
                        if (style.display !== 'none' && style.visibility !== 'hidden') {
                            result.cells.push({
                                index,
                                text: td.textContent.trim().substring(0, 30) + '...',
                                width: td.offsetWidth
                            });
                        }
                    });
                }
                
                return result;
            });
            
            console.log('  Visible headers:', visibleColumns.headers.map(h => `${h.text} (col ${h.index})`).join(', '));
            console.log('  Visible cells:', visibleColumns.cells.length);
            
            // Check for misalignment
            if (visibleColumns.headers.length !== visibleColumns.cells.length) {
                console.log(`  ⚠️  Column count mismatch: ${visibleColumns.headers.length} headers vs ${visibleColumns.cells.length} cells`);
            } else {
                console.log('  ✓ Column count matches');
            }
            
            // Check column widths
            let widthIssues = false;
            visibleColumns.headers.forEach((header, idx) => {
                if (visibleColumns.cells[idx]) {
                    const widthDiff = Math.abs(header.width - visibleColumns.cells[idx].width);
                    if (widthDiff > 10) {
                        console.log(`  ⚠️  Width mismatch in column ${idx}: header ${header.width}px vs cell ${visibleColumns.cells[idx].width}px`);
                        widthIssues = true;
                    }
                }
            });
            if (!widthIssues) {
                console.log('  ✓ Column widths aligned');
            }
            
            // Take screenshot
            await page.screenshot({ 
                path: `screenshots/tab-${i + 1}-${tabText.trim().replace(/\s+/g, '-')}.png`,
                clip: { x: 0, y: 400, width: 1200, height: 400 }
            });
        }
        
        // Test rapid tab switching
        console.log('\n🔄 Testing rapid tab switching...');
        for (let round = 0; round < 3; round++) {
            for (let i = 0; i < tabButtons.length; i++) {
                await tabButtons[i].click();
                await page.waitForTimeout(100);
            }
        }
        
        // Final check
        const finalCheck = await page.evaluate(() => {
            const tbody = document.querySelector('#comparison-tbody');
            const headers = document.querySelectorAll('#comparison-header-row th');
            return {
                tableExists: !!tbody,
                rowCount: tbody ? tbody.children.length : 0,
                headerCount: headers.length,
                hasContent: tbody ? tbody.textContent.trim().length > 0 : false
            };
        });
        
        console.log('\n📊 Final state:');
        console.log(`  - Table exists: ${finalCheck.tableExists}`);
        console.log(`  - Rows: ${finalCheck.rowCount}`);
        console.log(`  - Headers: ${finalCheck.headerCount}`);
        console.log(`  - Has content: ${finalCheck.hasContent}`);
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
    }
    
    console.log('\n👀 Keeping browser open for inspection (30 seconds)...');
    await page.waitForTimeout(30000);
    
    await browser.close();
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

testComparisonTabs();