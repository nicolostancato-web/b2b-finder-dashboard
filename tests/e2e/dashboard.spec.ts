import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('LAYOUT DASHBOARD (10 test)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndWaitDashboard(page)
  })

  test('2.1 — header presente con testo "B2B Finder"', async ({ page }) => {
    await expect(page.locator('text=B2B Finder').first()).toBeVisible({ timeout: 5000 })
  })

  test('2.2 — header mostra nome cliente "Larioelettra"', async ({ page }) => {
    await expect(page.locator('text=Larioelettra').first()).toBeVisible({ timeout: 5000 })
  })

  test('2.3 — header mostra stats numeriche (pattern "N Gare")', async ({ page }) => {
    const headerText = await page.locator('header').textContent()
    expect(headerText).toMatch(/\d+\s*Gare/)
  })

  test('2.4 — sidebar con link Dashboard e Mappa visibili', async ({ page }) => {
    await expect(page.locator('nav a[href="/dashboard"]').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('nav a[href="/dashboard/map"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('2.5 — voce Dashboard è attiva (ha classe emerald)', async ({ page }) => {
    const dashLink = page.locator('nav a[href="/dashboard"]').first()
    const cls = await dashLink.getAttribute('class')
    expect(cls).toContain('emerald')
  })

  test('2.6 — click "Mappa" naviga o mostra mappa', async ({ page }) => {
    await page.locator('nav a[href="/dashboard/map"]').first().click()
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('2.7 — legenda priorità mostra Alta/Media/Bassa con numeri', async ({ page }) => {
    await expect(page.locator('text=Alta priorità').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Media').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Bassa').first()).toBeVisible({ timeout: 5000 })
    const legendText = await page.locator('[class*="PRIORIT"], [class*="border"]').first().textContent()
    expect(legendText).toMatch(/\d+/)
  })

  test('2.8 — bottone logout presente nell\'header', async ({ page }) => {
    const logoutBtn = page.locator('header button[title="Logout"], header button').last()
    await expect(logoutBtn).toBeVisible({ timeout: 5000 })
  })

  test('2.9 — layout desktop 1280px: sidebar visibile, mappa occupa area main', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible({ timeout: 5000 })
    const canvas = page.locator('.mapboxgl-canvas').first()
    await expect(canvas).toBeVisible({ timeout: 10000 })
  })

  test('2.10 — layout mobile 375px: no overflow orizzontale', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(500)
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(390)
    await expect(page.locator('header').first()).toBeVisible({ timeout: 5000 })
  })

})
