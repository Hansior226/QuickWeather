// tests/e2e/basic-smoke.spec.js
import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
    test('app loads without errors', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Sprawdź czy strona się załadowała
        await expect(page.locator('body')).toBeVisible();

        // Sprawdź czy nie ma krytycznych błędów JS
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('navigation links exist', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Sprawdź czy podstawowe linki istnieją
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('a[href="/air-quality"]')).toBeVisible();
        await expect(page.locator('a[href="/uv-index"]')).toBeVisible();
    });
});
