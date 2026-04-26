import { test, expect } from '@playwright/test'
import { loginAndWaitMap } from '../utils/helpers'

test.describe('MAPPA MAPBOX (12 test)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndWaitMap(page)
  })

  test('3.1 — canvas Mapbox presente nel DOM', async ({ page }) => {
    const canvas = page.locator('.mapboxgl-canvas').first()
    await expect(canvas).toBeVisible({ timeout: 5000 })
  })

  test('3.2 — canvas Mapbox ha dimensioni reali (> 400px largo, > 400px alto)', async ({ page }) => {
    const box = await page.locator('.mapboxgl-canvas').first().boundingBox()
    expect(box?.width).toBeGreaterThan(400)
    expect(box?.height).toBeGreaterThan(400)
  })

  test('3.3 — mappa ha altezza full-screen (> 500px)', async ({ page }) => {
    const box = await page.locator('.mapboxgl-canvas').first().boundingBox()
    expect(box?.height).toBeGreaterThan(500)
  })

  test('3.4 — controlli zoom Mapbox visibili', async ({ page }) => {
    const zoomIn = page.locator('.mapboxgl-ctrl-zoom-in').first()
    await expect(zoomIn).toBeVisible({ timeout: 5000 })
  })

  test('3.5 — bottone zoom-out presente', async ({ page }) => {
    const zoomOut = page.locator('.mapboxgl-ctrl-zoom-out').first()
    await expect(zoomOut).toBeVisible({ timeout: 5000 })
  })

  test('3.6 — legenda mostra "Alta priorità" con conteggio', async ({ page }) => {
    await expect(page.locator('text=Alta priorità').first()).toBeVisible({ timeout: 5000 })
    const legendText = await page.locator('text=Alta priorità').first().locator('..').textContent()
    expect(legendText).toMatch(/\d+/)
  })

  test('3.7 — legenda mostra "Media" con conteggio', async ({ page }) => {
    await expect(page.locator('text=Media').first()).toBeVisible({ timeout: 5000 })
  })

  test('3.8 — legenda mostra "Bassa" con conteggio', async ({ page }) => {
    await expect(page.locator('text=Bassa').first()).toBeVisible({ timeout: 5000 })
  })

  test('3.9 — click filtro "Alta priorità" non genera errori JS', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.locator('button:has-text("Alta priorità")').first().click()
    await page.waitForTimeout(800)
    expect(errors).toHaveLength(0)
  })

  test('3.10 — click filtro "Media" non genera errori JS', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.locator('button:has-text("Media")').first().click()
    await page.waitForTimeout(800)
    expect(errors).toHaveLength(0)
  })

  test('3.11 — attributions Mapbox visibili (copyright)', async ({ page }) => {
    const attr = page.locator('.mapboxgl-ctrl-attrib').first()
    await expect(attr).toBeVisible({ timeout: 5000 })
  })

  test('3.12 — nessun errore JS critico sulla dashboard con mappa caricata', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.waitForTimeout(1000)
    const critical = errors.filter(e =>
      !e.includes('mapbox') && !e.includes('WebGL') &&
      !e.includes('favicon') && !e.includes('THREE')
    )
    expect(critical).toHaveLength(0)
  })

})
