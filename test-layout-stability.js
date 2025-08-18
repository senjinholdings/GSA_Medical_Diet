const { chromium } = require('playwright');

async function testLayoutStability() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    const page = await browser.newPage();
    page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('🚀 Testing layout stability during tab switches...\n');
    
    try {
        await page.goto('http://localhost:8081/mouthpiece002/index.html');
        await page.waitForLoadState('networkidle');
        
        // Scroll to comparison table
        await page.evaluate(() => {
            const table = document.querySelector('#comparison-table');
            if (table) {
                table.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await page.waitForTimeout(1000);
        
        const tabs = ['tab1', 'tab2', 'tab3'];
        const tabNames = ['総合', '施術内容', 'サービス'];
        const issues = [];
        
        for (let i = 0; i < tabs.length; i++) {
            console.log(`\n📋 Testing ${tabNames[i]} tab (${tabs[i]})...`);
            
            // Click the tab (use force click to bypass pointer-events issues)
            try {
                await page.click(`.comparison-tab-menu-item[data-tab="${tabs[i]}"]`, { force: true });
            } catch (e) {
                // Fallback to JavaScript click
                await page.evaluate((tabId) => {
                    const tab = document.querySelector(`.comparison-tab-menu-item[data-tab="${tabId}"]`);
                    if (tab) tab.click();
                }, tabs[i]);
            }
            await page.waitForTimeout(300);
            
            // Take screenshot
            await page.screenshot({ 
                path: `screenshots/layout-${tabs[i]}.png`,
                clip: { x: 0, y: 350, width: 1280, height: 450 }
            });
            
            // Check layout metrics
            const metrics = await page.evaluate(() => {
                const table = document.querySelector('#comparison-table');
                const tbody = document.querySelector('#comparison-tbody');
                const headers = document.querySelectorAll('#comparison-header-row th');
                const rows = tbody ? tbody.querySelectorAll('tr') : [];
                
                // Get visible headers and cells
                const visibleHeaders = [];
                const visibleCells = [];
                
                headers.forEach((th, index) => {
                    const style = window.getComputedStyle(th);
                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                        visibleHeaders.push({
                            index,
                            text: th.textContent.trim(),
                            width: th.offsetWidth,
                            height: th.offsetHeight,
                            left: th.offsetLeft
                        });
                    }
                });
                
                if (rows[0]) {
                    const cells = rows[0].querySelectorAll('td');
                    cells.forEach((td, index) => {
                        const style = window.getComputedStyle(td);
                        if (style.display !== 'none' && style.visibility !== 'hidden') {
                            visibleCells.push({
                                index,
                                width: td.offsetWidth,
                                height: td.offsetHeight,
                                left: td.offsetLeft
                            });
                        }
                    });
                }
                
                // Check table dimensions
                const tableRect = table ? table.getBoundingClientRect() : null;
                
                // Check for overlapping elements
                const overlaps = [];
                visibleHeaders.forEach((header, idx) => {
                    if (idx < visibleHeaders.length - 1) {
                        const nextHeader = visibleHeaders[idx + 1];
                        if (header.left + header.width > nextHeader.left) {
                            overlaps.push(`Header ${idx} overlaps with header ${idx + 1}`);
                        }
                    }
                });
                
                return {
                    tableWidth: tableRect ? tableRect.width : 0,
                    tableHeight: tableRect ? tableRect.height : 0,
                    visibleHeaders,
                    visibleCells,
                    rowCount: rows.length,
                    overlaps
                };
            });
            
            console.log(`  Table dimensions: ${metrics.tableWidth}x${metrics.tableHeight}`);
            console.log(`  Visible columns: ${metrics.visibleHeaders.length}`);
            console.log(`  Row count: ${metrics.rowCount}`);
            
            // Check for alignment issues
            let alignmentOk = true;
            metrics.visibleHeaders.forEach((header, idx) => {
                if (metrics.visibleCells[idx]) {
                    const cell = metrics.visibleCells[idx];
                    const leftDiff = Math.abs(header.left - cell.left);
                    const widthDiff = Math.abs(header.width - cell.width);
                    
                    if (leftDiff > 2) {
                        console.log(`  ⚠️ Column ${idx} left alignment off by ${leftDiff}px`);
                        issues.push(`${tabNames[i]}: Column ${idx} left misaligned by ${leftDiff}px`);
                        alignmentOk = false;
                    }
                    
                    if (widthDiff > 5) {
                        console.log(`  ⚠️ Column ${idx} width mismatch: header ${header.width}px vs cell ${cell.width}px`);
                        issues.push(`${tabNames[i]}: Column ${idx} width mismatch ${widthDiff}px`);
                        alignmentOk = false;
                    }
                }
            });
            
            if (alignmentOk) {
                console.log('  ✓ Column alignment OK');
            }
            
            // Check for overlaps
            if (metrics.overlaps.length > 0) {
                metrics.overlaps.forEach(overlap => {
                    console.log(`  ⚠️ ${overlap}`);
                    issues.push(`${tabNames[i]}: ${overlap}`);
                });
            } else {
                console.log('  ✓ No overlapping columns');
            }
            
            // Check header/cell count match
            if (metrics.visibleHeaders.length !== metrics.visibleCells.length) {
                console.log(`  ⚠️ Header/cell count mismatch: ${metrics.visibleHeaders.length} vs ${metrics.visibleCells.length}`);
                issues.push(`${tabNames[i]}: Header/cell count mismatch`);
            } else {
                console.log('  ✓ Header/cell count matches');
            }
        }
        
        // Test rapid switching
        console.log('\n🔄 Testing rapid tab switching...');
        for (let round = 0; round < 5; round++) {
            for (const tab of tabs) {
                await page.click(`.comparison-tab-menu-item[data-tab="${tab}"]`, { force: true });
                await page.waitForTimeout(100);
            }
        }
        
        // Final check
        const finalState = await page.evaluate(() => {
            const tbody = document.querySelector('#comparison-tbody');
            const activeTab = document.querySelector('.comparison-tab-menu-item.tab-active');
            return {
                hasContent: tbody ? tbody.children.length > 0 : false,
                activeTab: activeTab ? activeTab.textContent.trim() : 'None',
                tableVisible: tbody ? window.getComputedStyle(tbody).display !== 'none' : false
            };
        });
        
        console.log('\n📊 Final state:');
        console.log(`  Active tab: ${finalState.activeTab}`);
        console.log(`  Table has content: ${finalState.hasContent}`);
        console.log(`  Table visible: ${finalState.tableVisible}`);
        
        // Summary
        console.log('\n📋 Summary:');
        if (issues.length === 0) {
            console.log('  ✅ No layout issues detected!');
        } else {
            console.log(`  ⚠️ Found ${issues.length} issues:`);
            issues.forEach(issue => console.log(`    - ${issue}`));
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        await page.screenshot({ path: 'screenshots/error-layout.png', fullPage: true });
    }
    
    console.log('\n✅ Test completed! Check screenshots directory for visual verification.');
    await page.waitForTimeout(20000);
    
    await browser.close();
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

testLayoutStability();