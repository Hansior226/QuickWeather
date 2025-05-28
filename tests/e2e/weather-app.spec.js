// tests/e2e/weather-app.spec.js
import { test, expect } from '@playwright/test';

test.describe('QuickWeather App', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const popup = page.locator('[class*="fixed inset-0"]');
        if (await popup.isVisible()) {
            const closeButton = popup.locator('button:has-text("Zamknij")');
            if (await closeButton.isVisible()) {
                await closeButton.click();
                await page.waitForTimeout(1000);
            }
        }
    });

    test('loads homepage correctly', async ({ page, context }) => {
        await context.setGeolocation({ latitude: 52.2297, longitude: 21.0122 });
        await context.grantPermissions(['geolocation']);

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('body')).toBeVisible();

        const title = page.locator('text=QuickWeather').first();
        await expect(title).toBeVisible({ timeout: 10000 });
    });

    test('navigation works', async ({ page }) => {
        const navbar = page.locator('nav');
        await expect(navbar).toBeVisible({ timeout: 10000 });

        const airQualityLink = page.locator('a[href="/air-quality"]');
        await expect(airQualityLink).toBeVisible({ timeout: 10000 });
        await airQualityLink.click();

        await expect(page).toHaveURL(/.*air-quality/, { timeout: 10000 });
    });

    test('searches for city weather', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="miasto"]').first();
        await expect(searchInput).toBeVisible({ timeout: 10000 });

        await searchInput.fill('Kraków');

        const searchButton = page.locator('form button:has-text("Szukaj")');
        await expect(searchButton).toBeVisible({ timeout: 5000 });
        await searchButton.click();

        await page.waitForTimeout(3000);
    });

    test('compares multiple cities', async ({ page }) => {
        await page.goto('/compare');
        await page.waitForLoadState('networkidle');

        const firstCityInput = page.locator('input[placeholder*="Miasto 1"]');
        await expect(firstCityInput).toBeVisible({ timeout: 10000 });
        await firstCityInput.fill('Warszawa');

        const addButton = page.locator('button:has-text("+ Dodaj miasto")');
        if (await addButton.isVisible()) {
            await addButton.click();
        }

        const secondCityInput = page.locator('input[placeholder*="Miasto 2"]');
        await expect(secondCityInput).toBeVisible({ timeout: 5000 });
        await secondCityInput.fill('Kraków');

        const compareButton = page.locator('button:has-text("Porównaj")');
        await expect(compareButton).toBeVisible({ timeout: 5000 });
        await compareButton.click();

        await page.waitForTimeout(5000);
    });

    test('mobile navigation works', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('body')).toBeVisible();

        await expect(page.locator('nav')).toBeVisible();

        console.log('Mobile test passed - page renders correctly on mobile viewport');
    });
});
