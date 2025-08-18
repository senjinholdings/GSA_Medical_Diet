const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing 詳細を見る button styling...');
  
  const browser = await chromium.launch({ headless: false }); // Show browser for visual inspection
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#comparison-table', { timeout: 10000 });

    console.log('✅ Page loaded successfully\n');

    // Check the detail button styling
    const buttonStyles = await page.evaluate(() => {
      const detailButtons = document.querySelectorAll('.comparison-table .cta-link.detail-scroll-link');
      const results = [];
      
      detailButtons.forEach((button, index) => {
        const styles = window.getComputedStyle(button);
        results.push({
          index: index,
          text: button.textContent.trim(),
          background: styles.backgroundColor,
          color: styles.color,
          border: styles.border,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          fontSize: styles.fontSize,
          display: styles.display
        });
      });
      
      return results;
    });
    
    console.log('📊 詳細を見る Button Styles:');
    buttonStyles.forEach(style => {
      console.log(`\nButton ${style.index + 1}:`);
      console.log('  Text:', style.text);
      console.log('  Background:', style.background);
      console.log('  Color:', style.color);
      console.log('  Border:', style.border);
      console.log('  Border Radius:', style.borderRadius);
      console.log('  Padding:', style.padding);
      console.log('  Font Size:', style.fontSize);
      console.log('  Display:', style.display);
    });
    
    // Test hover state
    if (buttonStyles.length > 0) {
      console.log('\n🖱️ Testing hover state...');
      await page.hover('.comparison-table .cta-link.detail-scroll-link');
      await page.waitForTimeout(500);
      
      const hoverStyles = await page.evaluate(() => {
        const button = document.querySelector('.comparison-table .cta-link.detail-scroll-link');
        const styles = window.getComputedStyle(button);
        return {
          background: styles.backgroundColor,
          color: styles.color,
          border: styles.border
        };
      });
      
      console.log('Hover State:');
      console.log('  Background:', hoverStyles.background);
      console.log('  Color:', hoverStyles.color);
      console.log('  Border:', hoverStyles.border);
    }
    
    console.log('\n👀 Browser will stay open for 10 seconds for visual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error occurred:', error);
  } finally {
    await browser.close();
  }
})();