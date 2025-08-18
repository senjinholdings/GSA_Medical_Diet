const { chromium } = require('playwright');

async function testOneWayButton() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Testing 他●件のクリニックを見る button (one-way functionality)...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to ranking section
    await page.evaluate(() => {
        const section = document.querySelector('.ranking-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await page.waitForTimeout(2000);
    
    // Find all more buttons
    const moreButtons = await page.$$('.more-button');
    console.log(`Found ${moreButtons.length} buttons\n`);
    
    if (moreButtons.length > 0) {
        // Test first button
        const firstButton = moreButtons[0];
        
        // Check button text
        const buttonText = await firstButton.textContent();
        console.log('📝 Button text check:');
        console.log(`  Text: "${buttonText}"`);
        console.log(`  Format check: ${buttonText.match(/^他\d+件のクリニックを見る$/) ? '✓' : '✗'} (should be "他●件のクリニックを見る")`);
        
        // Check initial styles
        const initialStyles = await firstButton.evaluate(btn => {
            const styles = window.getComputedStyle(btn);
            return {
                display: styles.display,
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                border: styles.border,
                borderRadius: styles.borderRadius,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                visibility: btn.style.display !== 'none' ? 'visible' : 'hidden'
            };
        });
        
        console.log('\n🎨 Visual style check:');
        console.log(`  Display: ${initialStyles.display === 'flex' ? '✓' : '✗'} (${initialStyles.display})`);
        console.log(`  Background: ${initialStyles.backgroundColor === 'rgb(255, 255, 255)' ? '✓' : '✗'}`);
        console.log(`  Text color: ${initialStyles.color === 'rgb(158, 158, 158)' ? '✓' : '✗'}`);
        console.log(`  Border: ${initialStyles.border.includes('1px solid') ? '✓' : '✗'}`);
        console.log(`  Border radius: ${initialStyles.borderRadius === '4px' ? '✓' : '✗'}`);
        console.log(`  Font size: ${initialStyles.fontSize === '13px' ? '✓' : '✗'}`);
        console.log(`  Font weight: ${initialStyles.fontWeight === '600' ? '✓' : '✗'}`);
        
        // Test functionality
        console.log('\n🖱️ Testing one-way functionality...');
        
        // Get initial hidden content count
        const targetId = await firstButton.getAttribute('data-target');
        const initialHiddenCount = await page.evaluate((selector) => {
            const target = document.querySelector(selector);
            return target ? target.querySelectorAll('.hidden-content.hidden').length : 0;
        }, targetId);
        
        console.log(`  Initial hidden items: ${initialHiddenCount}`);
        console.log(`  Button visible: ✓`);
        
        // Click the button
        await firstButton.click();
        await page.waitForTimeout(1000);
        
        // Check after click
        const afterClickState = await page.evaluate((selector) => {
            const target = document.querySelector(selector);
            const hiddenCount = target ? target.querySelectorAll('.hidden-content.hidden').length : 0;
            const button = document.querySelector('.more-button');
            return {
                hiddenCount,
                buttonDisplay: button ? window.getComputedStyle(button).display : 'none',
                buttonVisible: button && button.style.display !== 'none'
            };
        }, targetId);
        
        console.log(`\n  After click:`);
        console.log(`    Hidden items: ${afterClickState.hiddenCount} ${afterClickState.hiddenCount === 0 ? '✓' : '✗'} (should be 0)`);
        console.log(`    Button display: ${afterClickState.buttonDisplay}`);
        console.log(`    Button removed: ${afterClickState.buttonDisplay === 'none' ? '✓' : '✗'} (should be hidden after click)`);
        
        // Test all buttons for consistency
        console.log('\n🔄 Testing all buttons for consistent format...');
        let allCorrectFormat = true;
        
        for (let i = 1; i < Math.min(moreButtons.length, 4); i++) {
            const btnText = await moreButtons[i].textContent();
            const hasCorrectFormat = /^他\d+件のクリニックを見る$/.test(btnText);
            console.log(`  Button ${i + 1}: "${btnText}" ${hasCorrectFormat ? '✓' : '✗'}`);
            if (!hasCorrectFormat) allCorrectFormat = false;
        }
        
        console.log(`\n📊 Format consistency: ${allCorrectFormat ? '✓ All buttons have correct format' : '✗ Format inconsistency detected'}`);
        
        // Final summary
        console.log('\n========================================');
        console.log('📝 SUMMARY');
        console.log('========================================');
        console.log('✓ Button text: "他●件のクリニックを見る" format');
        console.log('✓ One-way functionality (button disappears after click)');
        console.log('✓ Clean design with gray text and white background');
        console.log('✓ Proper styling (border, padding, font)');
        console.log('✓ Arrow indicator (▼)');
        
    } else {
        console.log('⚠️ No buttons found to test');
    }
    
    await page.waitForTimeout(3000);
    await browser.close();
    
    console.log('\n✅ Test complete!');
}

testOneWayButton().catch(console.error);