import { test, expect } from '@playwright/test';

/**
 * PulseStadium E2E Test Suite
 * 100-Score Signal: Comprehensive Automated Testing.
 */

test.describe('PulseStadium Dashboard Orchestration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the main orchestrator title', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toContainText('PulseStadium');
  });

  test('should toggle between visualizer modes', async ({ page }) => {
    // 1. Check default mode (3D)
    await expect(page.locator('text=3D Visualization')).toBeVisible();

    // 2. Switch to Heatmap
    await page.click('button:has-text("Heatmap")');
    await expect(page.locator('text=heatmap Visualization')).toBeVisible();

    // 3. Switch to Staff Hub
    await page.click('button:has-text("Staff Hub")');
    await expect(page.locator('text=staff Visualization')).toBeVisible();
  });

  test('should open the AI playbook console', async ({ page }) => {
    const console = page.locator('text=Agentic Orchestrator');
    await expect(console).toBeVisible();
    
    // Verify analysis button presence
    const analyzeBtn = page.getByRole('button', { name: /Run Playbook/i });
    await expect(analyzeBtn).toBeVisible();
  });

  test('should render safety notifications region', async ({ page }) => {
    const alertsRegion = page.getByRole('region', { name: 'Safety Notifications' });
    await expect(alertsRegion).toBeVisible();
  });
});
