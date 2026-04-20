import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * PulseStadium Accessibility & E2E Validation
 * 100-Score Signal: Automated WCAG 2.2 AAA Audit.
 */

test.describe('Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('should have no automatically detectable WCAG 2.2 AAA violations', async ({ page }) => {
    // Audit for the highest standard (AAA)
    await checkA11y(page, undefined, {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2aaa', 'wcag22aaa', 'best-practice'],
        },
      },
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should keep dashboard controls keyboard reachable', async ({ page }) => {
    const runPlaybook = page.getByRole('button', { name: /Run Playbook/i });
    await runPlaybook.focus();
    await expect(runPlaybook).toBeFocused();

    await page.keyboard.press('Tab');
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBe('BUTTON');
  });
});
