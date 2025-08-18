const { chromium } = require('playwright');

async function testDisclaimerDebug() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Testing clinic disclaimer data flow...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if DataManager is properly initialized
    const dataManagerInfo = await page.evaluate(() => {
        if (!window.dataManager) return { error: 'DataManager not found' };
        
        const dm = window.dataManager;
        return {
            hasClinics: Array.isArray(dm.clinics),
            clinicCount: dm.clinics ? dm.clinics.length : 0,
            clinics: dm.clinics ? dm.clinics.map(c => ({ name: c.name, code: c.code })) : [],
            hasClinicTexts: !!dm.clinicTexts,
            clinicTextKeys: dm.clinicTexts ? Object.keys(dm.clinicTexts) : []
        };
    });
    
    console.log('DataManager Status:');
    console.log('  Has clinics array:', dataManagerInfo.hasClinics);
    console.log('  Number of clinics:', dataManagerInfo.clinicCount);
    console.log('  Clinics:', dataManagerInfo.clinics);
    console.log('  Has clinic texts:', dataManagerInfo.hasClinicTexts);
    console.log('  Clinic text keys:', dataManagerInfo.clinicTextKeys);
    
    // Test getClinicText function
    console.log('\n📋 Testing getClinicText function:');
    
    const testResults = await page.evaluate(() => {
        if (!window.dataManager) return { error: 'DataManager not found' };
        
        const dm = window.dataManager;
        const results = [];
        
        // Test for each clinic
        const testCodes = ['omt', 'kireiline', 'ws', 'zenyum'];
        
        testCodes.forEach(code => {
            const disclaimer = dm.getClinicText(code, '比較表の注意事項', '');
            const clinicName = dm.getClinicText(code, 'クリニック名', '');
            
            results.push({
                code: code,
                clinicName: clinicName,
                hasDisclaimer: disclaimer !== '',
                disclaimerPreview: disclaimer ? disclaimer.substring(0, 50) + '...' : 'None'
            });
        });
        
        return results;
    });
    
    testResults.forEach(result => {
        console.log(`  ${result.code}:`);
        console.log(`    Clinic name: ${result.clinicName}`);
        console.log(`    Has disclaimer: ${result.hasDisclaimer ? '✓' : '✗'}`);
        console.log(`    Preview: "${result.disclaimerPreview}"`);
    });
    
    // Check the comparison table generation
    console.log('\n🔄 Checking comparison table generation:');
    
    const tableInfo = await page.evaluate(() => {
        const tbody = document.getElementById('comparison-tbody');
        if (!tbody) return { error: 'Table not found' };
        
        const rows = tbody.querySelectorAll('tr');
        const clinics = [];
        
        rows.forEach(row => {
            const clinicCell = row.querySelector('.clinic-link');
            if (clinicCell) {
                clinics.push(clinicCell.textContent.trim());
            }
        });
        
        return {
            rowCount: rows.length,
            clinics: clinics
        };
    });
    
    console.log('  Table rows:', tableInfo.rowCount);
    console.log('  Clinics in table:', tableInfo.clinics);
    
    // Check disclaimers in the accordion
    console.log('\n📋 Checking disclaimers in accordion:');
    
    const disclaimerButton = await page.$('.main-disclaimer-header');
    if (disclaimerButton) {
        await disclaimerButton.click();
        await page.waitForTimeout(500);
        
        const disclaimerInfo = await page.evaluate(() => {
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
                        hasText: text.textContent.length > 0
                    });
                }
            });
            
            return {
                isVisible: content.style.display !== 'none',
                disclaimerCount: disclaimerDivs.length,
                disclaimers: disclaimers
            };
        });
        
        console.log('  Accordion visible:', disclaimerInfo.isVisible ? '✓' : '✗');
        console.log('  Number of disclaimers:', disclaimerInfo.disclaimerCount);
        
        if (disclaimerInfo.disclaimers.length > 0) {
            console.log('  Disclaimers found:');
            disclaimerInfo.disclaimers.forEach((d, i) => {
                console.log(`    ${i + 1}. ${d.clinic} - Has text: ${d.hasText ? '✓' : '✗'}`);
            });
        }
    }
    
    console.log('\n========================================');
    console.log('📝 DEBUGGING COMPLETE');
    console.log('========================================');
    
    await page.waitForTimeout(3000);
    await browser.close();
    
    console.log('\n✅ Debug test complete!');
}

testDisclaimerDebug().catch(console.error);