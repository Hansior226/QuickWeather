// tests/e2e/weather-app.spec.js
import { test, expect } from '@playwright/test';

test.describe('Weather App E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('loads homepage and displays weather', async ({ page }) => {
        // Mock geolocation
        await page.context().grantPermissions(['geolocation']);
        await page.setGeolocation({ latitude: 52.2297, longitude: 21.0122 });

        await expect(page.locator('h1')).toContainText('QuickWeather');

        // Wait for weather data to load
        await expect(page.locator('[data-testid="weather-display"]')).toBeVisible();
    });

    test('navigates between pages', async ({ page }) => {
        await page.click('text=Jakość powietrza');
        await expect(page).toHaveURL(/.*air-quality/);
        await expect(page.locator('h1')).toContainText('Jakość powietrza');

        await page.click('text=Indeks UV');
        await expect(page).toHaveURL(/.*uv-index/);
        await expect(page.locator('h1')).toContainText('Indeks UV');
    });

    test('searches for city weather', async ({ page }) => {
        await page.fill('input[placeholder*="Wyszukaj miasto"]', 'Kraków');
        await page.click('text=Szukaj');

        await expect(page.locator('text=Kraków')).toBeVisible();
    });

    test('compares multiple cities', async ({ page }) => {
        await page.goto('http://localhost:3000/compare');

        await page.fill('input[placeholder*="Miasto 1"]', 'Warszawa');
        await page.click('text=+ Dodaj miasto');
        await page.fill('input[placeholder*="Miasto 2"]', 'Kraków');

        await page.click('text=Porównaj');

        await expect(page.locator('text=Warszawa')).toBeVisible();
        await expect(page.locator('text=Kraków')).toBeVisible();
    });

    test('mobile navigation works', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        await page.click('[aria-label="Toggle menu"]');
        await expect(page.locator('text=Jakość powietrza')).toBeVisible();

        await page.click('text=Ostrzeżenia');
        await expect(page).toHaveURL(/.*alerts/);
    });
});
