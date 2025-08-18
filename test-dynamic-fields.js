const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing dynamic field mapping for comparison tables...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.text().includes('Dynamic mapping') || msg.text().includes('comparison')) {
      console.log('Browser Console:', msg.text());
    }
  });
  
  try {
    await page.goto('http://localhost:3000/mouthpiece002/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#comparison-table', { timeout: 10000 });

    console.log('✅ Page loaded successfully\n');

    // Check initial tab state
    const initialData = await page.evaluate(() => {
      const result = {
        activeTab: null,
        headers: [],
        firstRowData: {},
        headerConfig: null
      };
      
      // Get header configuration
      if (window.dataManager && window.dataManager.clinicTexts) {
        result.headerConfig = window.dataManager.clinicTexts['比較表ヘッダー設定'];
      }
      
      // Get active tab
      const activeTab = document.querySelector('.comparison-tab-menu-item.tab-active');
      if (activeTab) result.activeTab = activeTab.textContent.trim();
      
      // Get headers
      const headers = document.querySelectorAll('#comparison-table thead th');
      result.headers = Array.from(headers).map(h => h.textContent.trim());
      
      // Get first row data
      const firstRow = document.querySelector('#comparison-table tbody tr:first-child');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        cells.forEach((cell, index) => {
          const header = result.headers[index];
          if (header) {
            result.firstRowData[header] = cell.textContent.trim();
          }
        });
      }
      
      return result;
    });
    
    console.log('📊 Header Configuration from JSON:');
    if (initialData.headerConfig) {
      console.log('  比較表ヘッダー1:', initialData.headerConfig['比較表ヘッダー1']);
      console.log('  比較表ヘッダー2:', initialData.headerConfig['比較表ヘッダー2']);
      console.log('  比較表ヘッダー3:', initialData.headerConfig['比較表ヘッダー3']);
    }
    
    console.log('\n📊 Initial State (Tab 1 - 総合):');
    console.log('  Active Tab:', initialData.activeTab);
    console.log('  Headers:', initialData.headers);
    
    console.log('\n📋 First Row Data:');
    Object.entries(initialData.firstRowData).forEach(([header, value]) => {
      const displayValue = value && value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`  ${header}: ${value ? '✅ ' + displayValue : '❌ Empty'}`);
    });
    
    // Test direct data retrieval
    console.log('\n🧪 Direct Data Retrieval Test:');
    const directTest = await page.evaluate(() => {
      if (window.dataManager) {
        const headerConfig = window.dataManager.clinicTexts['比較表ヘッダー設定'] || {};
        const field2 = headerConfig['比較表ヘッダー2'] || 'コスト';
        const field3 = headerConfig['比較表ヘッダー3'] || '人気';
        
        return {
          field2Name: field2,
          field3Name: field3,
          comparison2: window.dataManager.getClinicText('omt', 'comparison2', 'DEFAULT'),
          comparison3: window.dataManager.getClinicText('omt', 'comparison3', 'DEFAULT'),
          directField2: window.dataManager.getClinicText('omt', field2, 'DEFAULT'),
          directField3: window.dataManager.getClinicText('omt', field3, 'DEFAULT')
        };
      }
      return null;
    });
    
    if (directTest) {
      console.log('  Field 2 name from config:', directTest.field2Name);
      console.log('  Field 3 name from config:', directTest.field3Name);
      console.log('  comparison2 retrieval:', directTest.comparison2.substring(0, 50) + '...');
      console.log('  comparison3 retrieval:', directTest.comparison3.substring(0, 50) + '...');
      console.log('  Direct ' + directTest.field2Name + ' retrieval:', directTest.directField2.substring(0, 50) + '...');
      console.log('  Direct ' + directTest.field3Name + ' retrieval:', directTest.directField3.substring(0, 50) + '...');
    }
    
    // Summary
    const hasData = Object.values(initialData.firstRowData).filter(v => v && v !== '').length >= 4;
    
    console.log('\n🏁 Test Result:');
    if (hasData && !initialData.firstRowData['費用'].includes('Empty') && !initialData.firstRowData['特徴'].includes('Empty')) {
      console.log('✅ SUCCESS: Dynamic field mapping is working correctly!');
    } else {
      console.log('❌ FAILURE: Some fields are not displaying correctly');
      if (!initialData.firstRowData['費用'] || initialData.firstRowData['費用'] === '') {
        console.log('  - 費用 field is empty');
      }
      if (!initialData.firstRowData['特徴'] || initialData.firstRowData['特徴'] === '') {
        console.log('  - 特徴 field is empty');
      }
    }
    
  } catch (error) {
    console.error('❌ Error occurred:', error);
  } finally {
    await browser.close();
  }
})();