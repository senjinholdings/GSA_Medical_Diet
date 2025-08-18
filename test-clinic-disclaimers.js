const { chromium } = require('playwright');

async function testClinicDisclaimers() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Testing clinic disclaimers below comparison table...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to comparison section
    await page.evaluate(() => {
        const section = document.querySelector('.comparison-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(2000);
    
    // Click the disclaimers accordion to open it
    const disclaimerButton = await page.$('.main-disclaimer-header');
    if (disclaimerButton) {
        await disclaimerButton.click();
        await page.waitForTimeout(500);
        
        console.log('✓ Opened disclaimers accordion');
        
        // Check the content
        const disclaimerContent = await page.evaluate(() => {
            const content = document.getElementById('main-content');
            if (!content) return null;
            
            const clinicDisclaimers = content.querySelectorAll('div[style*="border-left"]');
            const results = [];
            
            clinicDisclaimers.forEach(div => {
                const title = div.querySelector('div[style*="font-weight: 600"]');
                const text = div.querySelector('div[style*="font-size: 10px"]');
                
                if (title && text) {
                    results.push({
                        clinicName: title.textContent,
                        disclaimer: text.textContent.substring(0, 100) + '...'
                    });
                }
            });
            
            return {
                isVisible: content.style.display !== 'none',
                disclaimerCount: clinicDisclaimers.length,
                disclaimers: results
            };
        });
        
        if (disclaimerContent) {
            console.log('\n📋 Disclaimer Content:');
            console.log(`  Visible: ${disclaimerContent.isVisible ? '✓' : '✗'}`);
            console.log(`  Number of clinic disclaimers: ${disclaimerContent.disclaimerCount}`);
            
            if (disclaimerContent.disclaimers.length > 0) {
                console.log('\n  Clinic Disclaimers:');
                disclaimerContent.disclaimers.forEach((item, index) => {
                    console.log(`    ${index + 1}. ${item.clinicName}`);
                    console.log(`       "${item.disclaimer}"`);
                });
            }
        }
        
        // Check if disclaimers match the clinics in the comparison table
        const tableData = await page.evaluate(() => {
            const tbody = document.getElementById('comparison-tbody');
            if (!tbody) return [];
            
            const rows = tbody.querySelectorAll('tr');
            const clinics = [];
            
            rows.forEach(row => {
                const clinicCell = row.querySelector('.clinic-link');
                if (clinicCell) {
                    clinics.push(clinicCell.textContent.trim());
                }
            });
            
            return clinics;
        });
        
        console.log('\n🔄 Verification:');
        console.log('  Clinics in comparison table:');
        tableData.forEach((clinic, index) => {
            console.log(`    ${index + 1}. ${clinic}`);
        });
        
        // Take screenshot of disclaimers
        await page.screenshot({ 
            path: 'clinic-disclaimers.png',
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
        console.log('\n📸 Screenshot saved as clinic-disclaimers.png');
        
    } else {
        console.log('⚠️ Disclaimer button not found');
    }
    
    console.log('\n========================================');
    console.log('📝 SUMMARY');
    console.log('========================================');
    console.log('Each clinic\'s specific disclaimers should be:');
    console.log('✓ Displayed below the comparison table');
    console.log('✓ Organized by clinic name');
    console.log('✓ Styled with left border for clarity');
    console.log('✓ Collapsible via accordion');
    
    await page.waitForTimeout(3000);
    await browser.close();
    
    console.log('\n✅ Test complete!');
}

testClinicDisclaimers().catch(console.error);