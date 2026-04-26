import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('MAPPA RENDERING', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndWaitDashboard(page)
  })

  test('T11 — container mappa presente con dimensioni corrette', async ({ page }) => {
    // Mapbox monta un canvas dentro il container
    const mapContainer = page.locator('main .absolute').first()
    await expect(mapContainer).toBeVisible()
    const box = await mapContainer.boundingBox()
    expect(box?.width).toBeGreaterThan(400)
    expect(box?.height).toBeGreaterThan(300)
  })

  test('T12 — Mapbox canvas carica entro 5 secondi', async ({ page }) => {
    const t0 = Date.now()
    const canvas = page.locator('.mapboxgl-canvas').first()
    await expect(canvas).toBeVisible({ timeout: 8000 })
    const elapsed = Date.now() - t0
    expect(elapsed, `Canvas visibile in ${elapsed}ms`).toBeLessThan(8000)
  })

  test('T13 — canvas Mapbox ha dimensioni reali (non zero)', async ({ page }) => {
    const canvas = page.locator('.mapboxgl-canvas').first()
    await expect(canvas).toBeVisible({ timeout: 8000 })
    const box = await canvas.boundingBox()
    expect(box?.width).toBeGreaterThan(100)
    expect(box?.height).toBeGreaterThan(100)
  })

  test('T14 — controlli mappa Mapbox visibili', async ({ page }) => {
    await page.locator('.mapboxgl-canvas').waitFor({ state: 'visible', timeout: 8000 })
    // Navigation control (zoom +/-)
    const ctrl = page.locator('.mapboxgl-ctrl-zoom-in, .mapboxgl-ctrl').first()
    await expect(ctrl).toBeVisible({ timeout: 5000 })
  })

  test('T15 — legenda colori presente con voci alta/media/bassa', async ({ page }) => {
    await page.locator('.mapboxgl-canvas').waitFor({ state: 'visible', timeout: 8000 })
    // Legenda ha testo "Alta priorità"
    await expect(page.locator('text=Alta priorità').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Media').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Bassa').first()).toBeVisible({ timeout: 5000 })
  })

})
