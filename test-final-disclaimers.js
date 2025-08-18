const { chromium } = require('playwright');

async function testFinalDisclaimers() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Final test for clinic disclaimers...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to comparison section
    await page.evaluate(() => {
        const section = document.querySelector('.comparison-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(2000);
    
    // Check the disclaimers before clicking
    console.log('📋 Before clicking accordion:');
    const beforeClick = await page.evaluate(() => {
        const content = document.getElementById('main-content');
        if (!content) return { error: 'Content not found' };
        
        const disclaimerDivs = content.querySelectorAll('div[style*="border-left"]');
        return {
            childCount: content.children.length,
            disclaimerCount: disclaimerDivs.length,
            display: content.style.display || 'not set',
            innerHTML: content.innerHTML ? 'Has content' : 'Empty'
        };
    });
    console.log('  Child count:', beforeClick.childCount);
    console.log('  Disclaimer count:', beforeClick.disclaimerCount);
    console.log('  Display:', beforeClick.display);
    console.log('  Content:', beforeClick.innerHTML);
    
    // Click the disclaimers accordion to open it
    const disclaimerButton = await page.$('.main-disclaimer-header');
    if (disclaimerButton) {
        console.log('\n✓ Clicking disclaimer accordion...');
        await disclaimerButton.click();
        await page.waitForTimeout(500);
        
        // Check after clicking
        console.log('\n📋 After clicking accordion:');
        const afterClick = await page.evaluate(() => {
            const content = document.getElementById('main-content');
            if (!content) return { error: 'Content not found' };
            
            const disclaimerDivs = content.querySelectorAll('div[style*="border-left"]');
            const disclaimers = [];
            
            disclaimerDivs.forEach(div => {
                const title = div.querySelector('div[style*="font-weight: 600"]');
                const text = div.querySelector('div[style*="font-size: 10px"]');
                
                if (title && text) {
                    disclaimers.push({
                        clinic: title.textContent,
                        textPreview: text.textContent.substring(0, 50) + '...'
                    });
                }
            });
            
            return {
                childCount: content.children.length,
                disclaimerCount: disclaimerDivs.length,
                display: content.style.display || 'not set',
                innerHTML: content.innerHTML ? 'Has content' : 'Empty',
                disclaimers: disclaimers
            };
        });
        
        console.log('  Child count:', afterClick.childCount);
        console.log('  Disclaimer count:', afterClick.disclaimerCount);
        console.log('  Display:', afterClick.display);
        console.log('  Content:', afterClick.innerHTML);
        
        if (afterClick.disclaimers.length > 0) {
            console.log('\n✅ Disclaimers found:');
            afterClick.disclaimers.forEach((d, i) => {
                console.log(`  ${i + 1}. ${d.clinic}`);
                console.log(`     "${d.textPreview}"`);
            });
        } else {
            console.log('\n⚠️ No disclaimers found in the accordion');
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: 'disclaimers-final.png',
            fullPage: false,
            clip: {
                x: 0,
                y: await page.evaluate(() => {
                    const section = document.querySelector('.disclaimer-accordion');
                    return section ? section.getBoundingClientRect().top + window.scrollY : 0;
                }),
                width: 1200,
                height: 600
            }
        });
        console.log('\n📸 Screenshot saved as disclaimers-final.png');
    } else {
        console.log('⚠️ Disclaimer button not found');
    }
    
    console.log('\n========================================');
    console.log('✅ Test complete!');
    
    await page.waitForTimeout(3000);
    await browser.close();
}

testFinalDisclaimers().catch(console.error);