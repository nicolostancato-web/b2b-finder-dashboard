import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('PERFORMANCE E STABILITÀ', () => {

  test('T21 — pagina login carica entro 2 secondi', async ({ page }) => {
    const t0 = Date.now()
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    const elapsed = Date.now() - t0
    expect(elapsed).toBeLessThan(2000)
  })

  test('T22 — dashboard carica entro 5 secondi', async ({ page }) => {
    const t0 = Date.now()
    await loginAndWaitDashboard(page)
    const elapsed = Date.now() - t0
    expect(elapsed).toBeLessThan(5000)
  })

  test('T23 — zero errori JS critici su login page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const critical = errors.filter(e =>
      !e.includes('mapbox') &&
      !e.includes('favicon') &&
      !e.includes('WebGL')
    )
    expect(critical.length).toBe(0)
  })

  test('T24 — zero errori JS critici su dashboard', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await loginAndWaitDashboard(page)
    await page.waitForTimeout(3000)

    const critical = errors.filter(e =>
      !e.includes('mapbox') &&
      !e.includes('WebGL') &&
      !e.includes('favicon')
    )
    expect(critical, `Errori JS: ${critical.join('; ')}`).toHaveLength(0)
  })

  test('T25 — layout responsive a 375px (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAndWaitDashboard(page)

    // La sidebar non deve sporgere e rompere il layout
    const body = await page.locator('body').boundingBox()
    expect(body?.width).toBeLessThanOrEqual(375)

    // Header visibile
    await expect(page.locator('header').first()).toBeVisible()

    // Nessun overflow orizzontale
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(380) // piccola tolleranza
  })

})
