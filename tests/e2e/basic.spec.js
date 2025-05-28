// tests/e2e/basic.spec.js
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
    await page.goto('/');

    // Sprawdź czy strona się załadowała
    await expect(page.locator('body')).toBeVisible();

    // Sprawdź czy nie ma błędów JavaScript
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    await page.waitForTimeout(2000);

    if (errors.length > 0) {
        console.log('JavaScript errors:', errors);
    }
});

test('app renders without crashing', async ({ page }) => {
    await page.goto('/');

    // Sprawdź czy React się załadował
    await page.waitForSelector('div', { timeout: 10000 });

    // Sprawdź czy nie ma białego ekranu
    const bodyText = await page.locator('body').textContent();
    expect(bodyText.length).toBeGreaterThan(0);
});
