const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Comparison Table Visual Test for cryolipolysis_copy', () => {

  let clinicData;

  test.beforeAll(() => {
    const jsonPath = path.resolve(__dirname, '../public/cryolipolysis_copy/data/clinic-texts.json');
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    clinicData = JSON.parse(fileContent);
  });

  test('should display the comparison table correctly and match visual snapshot', async ({ page }) => {
    await page.goto('/public/cryolipolysis_copy/index.html');

    // Wait for the table to be populated by JavaScript
    await page.waitForSelector('#comparison-tbody tr');

    const tableContainer = page.locator('.comparison-section');

    // 1. Verify Headers
    const allKeys = Object.keys(Object.values(clinicData).filter(c => c.クリニック名)[0]);
    const expectedHeaders = ['クリニック', ...allKeys.slice(12, 20), '公式サイト'];
    const tableHeaders = await page.locator('.comparison-table thead th').allTextContents();
    expect(tableHeaders.map(h => h.trim())).toEqual(expectedHeaders.map(h => h.trim()));

    // 2. Verify Row Count
    const clinics = Object.values(clinicData).filter(c => c.クリニック名);
    const rowCount = await page.locator('#comparison-tbody tr').count();
    expect(rowCount).toBe(clinics.length);

    // 3. Verify Content of the first row
    const firstClinic = clinics[0];
    const firstRow = page.locator('#comparison-tbody tr').first();
    await expect(firstRow.locator('td').nth(0)).toContainText(firstClinic['クリニック名']);
    const popularPlanIndex = expectedHeaders.indexOf('人気プラン');
    if (popularPlanIndex > -1) {
        await expect(firstRow.locator('td').nth(popularPlanIndex)).toContainText(firstClinic['人気プラン']);
    }

    // 4. Take a screenshot for visual verification
    await expect(tableContainer).toHaveScreenshot('cryolipolysis-copy-comparison-table.png');
  });
});
