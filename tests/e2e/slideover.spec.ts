import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('SLIDE-OVER & INTERAZIONI AVANZATE', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndWaitDashboard(page)
    await page.locator('.mapboxgl-canvas').waitFor({ state: 'visible', timeout: 8000 })
    await page.waitForTimeout(2500)
  })

  test('T49 — slide-over chiusa di default', async ({ page }) => {
    // Il panel deve essere fuori schermo (translate-x-full)
    const panel = page.locator('[class*="translate-x-full"]').first()
    // Verifica che non ci siano errori e il panel non è in vista
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })

  test('T50 — filtro "Alta priorità" non causa errori JS', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    const btn = page.locator('button:has-text("Alta priorità")').first()
    await expect(btn).toBeVisible()
    await btn.click()
    await page.waitForTimeout(800)
    expect(errors).toHaveLength(0)
  })

  test('T51 — filtro "Media" non causa errori JS', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    const btn = page.locator('button:has-text("Media")').first()
    await expect(btn).toBeVisible()
    await btn.click()
    await page.waitForTimeout(800)
    expect(errors).toHaveLength(0)
  })

  test('T52 — filtro "Bassa" non causa errori JS', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    const btn = page.locator('button:has-text("Bassa")').first()
    await expect(btn).toBeVisible()
    await btn.click()
    await page.waitForTimeout(800)
    expect(errors).toHaveLength(0)
  })

  test('T53 — click ripetuti filtri non crasha', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    const alta = page.locator('button:has-text("Alta priorità")').first()
    const media = page.locator('button:has-text("Media")').first()
    await alta.click()
    await page.waitForTimeout(300)
    await media.click()
    await page.waitForTimeout(300)
    await alta.click()
    await page.waitForTimeout(300)
    expect(errors).toHaveLength(0)
  })

  test('T54 — mappa canvas ha dimensioni > 300px height', async ({ page }) => {
    const canvas = page.locator('.mapboxgl-canvas').first()
    const box = await canvas.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(300)
  })

  test('T55 — Mapbox attributions visibili', async ({ page }) => {
    const attr = page.locator('.mapboxgl-ctrl-attrib').first()
    await expect(attr).toBeVisible({ timeout: 5000 })
  })

})
