const { chromium } = require('playwright');

async function testMoreButton() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Testing もっと見る button design and functionality...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to ranking section to load content
    await page.evaluate(() => {
        const section = document.querySelector('.ranking-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(2000);
    
    // Find all more buttons
    const moreButtons = await page.$$('.more-button');
    console.log(`Found ${moreButtons.length} もっと見る buttons`);
    
    if (moreButtons.length > 0) {
        // Test first button
        const firstButton = moreButtons[0];
        
        // Check initial styles
        const initialStyles = await firstButton.evaluate(btn => {
            const styles = window.getComputedStyle(btn);
            return {
                display: styles.display,
                padding: styles.padding,
                border: styles.border,
                borderRadius: styles.borderRadius,
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                cursor: styles.cursor
            };
        });
        
        console.log('\n📋 Button styles check:');
        console.log(`  Display: ${initialStyles.display === 'flex' ? '✓' : '✗'} (${initialStyles.display})`);
        console.log(`  Padding: ${initialStyles.padding.includes('12px') ? '✓' : '✗'} (${initialStyles.padding})`);
        console.log(`  Border: ${initialStyles.border.includes('1px solid') ? '✓' : '✗'} (${initialStyles.border})`);
        console.log(`  Border radius: ${initialStyles.borderRadius === '4px' ? '✓' : '✗'} (${initialStyles.borderRadius})`);
        console.log(`  Background: ${initialStyles.backgroundColor === 'rgb(255, 255, 255)' ? '✓' : '✗'} (${initialStyles.backgroundColor})`);
        console.log(`  Color: ${initialStyles.color === 'rgb(158, 158, 158)' ? '✓' : '✗'} (${initialStyles.color})`);
        console.log(`  Font size: ${initialStyles.fontSize === '13px' ? '✓' : '✗'} (${initialStyles.fontSize})`);
        console.log(`  Font weight: ${initialStyles.fontWeight === '600' ? '✓' : '✗'} (${initialStyles.fontWeight})`);
        console.log(`  Cursor: ${initialStyles.cursor === 'pointer' ? '✓' : '✗'} (${initialStyles.cursor})`);
        
        // Check text content
        const buttonText = await firstButton.evaluate(btn => {
            const moreText = btn.querySelector('.more-text');
            const lessText = btn.querySelector('.less-text');
            return {
                moreText: moreText ? moreText.textContent : null,
                lessText: lessText ? lessText.textContent : null,
                moreTextVisible: moreText ? window.getComputedStyle(moreText).display !== 'none' : false,
                lessTextVisible: lessText ? window.getComputedStyle(lessText).display !== 'none' : false
            };
        });
        
        console.log('\n📝 Button text check:');
        console.log(`  More text: "${buttonText.moreText}" (visible: ${buttonText.moreTextVisible ? '✓' : '✗'})`);
        console.log(`  Less text: "${buttonText.lessText}" (visible: ${buttonText.lessTextVisible ? '✗' : '✓'})`);
        
        // Test click functionality
        console.log('\n🖱️ Testing click functionality...');
        
        // Get initial hidden content count
        const targetId = await firstButton.getAttribute('data-target');
        const initialHiddenCount = await page.evaluate((selector) => {
            const target = document.querySelector(selector);
            return target ? target.querySelectorAll('.hidden-content.hidden').length : 0;
        }, targetId);
        
        console.log(`  Initial hidden items: ${initialHiddenCount}`);
        
        // Click the button
        await firstButton.click();
        await page.waitForTimeout(500);
        
        // Check after click
        const afterClickState = await firstButton.evaluate(btn => {
            const moreText = btn.querySelector('.more-text');
            const lessText = btn.querySelector('.less-text');
            return {
                hasActiveClass: btn.classList.contains('active'),
                moreTextVisible: moreText ? window.getComputedStyle(moreText).display !== 'none' : false,
                lessTextVisible: lessText ? window.getComputedStyle(lessText).display !== 'none' : false
            };
        });
        
        const afterClickHiddenCount = await page.evaluate((selector) => {
            const target = document.querySelector(selector);
            return target ? target.querySelectorAll('.hidden-content.hidden').length : 0;
        }, targetId);
        
        console.log(`  After click - Active class: ${afterClickState.hasActiveClass ? '✓' : '✗'}`);
        console.log(`  After click - More text visible: ${afterClickState.moreTextVisible ? '✗' : '✓'}`);
        console.log(`  After click - Less text visible: ${afterClickState.lessTextVisible ? '✓' : '✗'}`);
        console.log(`  After click - Hidden items: ${afterClickHiddenCount} (should be 0)`);
        
        // Click again to close
        await firstButton.click();
        await page.waitForTimeout(500);
        
        const afterSecondClickState = await firstButton.evaluate(btn => {
            const moreText = btn.querySelector('.more-text');
            const lessText = btn.querySelector('.less-text');
            return {
                hasActiveClass: btn.classList.contains('active'),
                moreTextVisible: moreText ? window.getComputedStyle(moreText).display !== 'none' : false,
                lessTextVisible: lessText ? window.getComputedStyle(lessText).display !== 'none' : false
            };
        });
        
        const afterSecondClickHiddenCount = await page.evaluate((selector) => {
            const target = document.querySelector(selector);
            return target ? target.querySelectorAll('.hidden-content.hidden').length : 0;
        }, targetId);
        
        console.log(`  After second click - Active class: ${afterSecondClickState.hasActiveClass ? '✗' : '✓'}`);
        console.log(`  After second click - More text visible: ${afterSecondClickState.moreTextVisible ? '✓' : '✗'}`);
        console.log(`  After second click - Less text visible: ${afterSecondClickState.lessTextVisible ? '✗' : '✓'}`);
        console.log(`  After second click - Hidden items: ${afterSecondClickHiddenCount} (should be same as initial)`);
        
        // Visual comparison
        console.log('\n🎨 Visual design check:');
        console.log('  Button should have:');
        console.log('  - Clean, minimal design with light gray border');
        console.log('  - Gray text color (#9e9e9e)');
        console.log('  - White background');
        console.log('  - Rounded corners (4px)');
        console.log('  - Arrow indicator that rotates when active');
        
    } else {
        console.log('⚠️ No もっと見る buttons found on the page');
    }
    
    await page.waitForTimeout(5000);
    await browser.close();
    
    console.log('\n✅ Test complete!');
}

testMoreButton().catch(console.error);