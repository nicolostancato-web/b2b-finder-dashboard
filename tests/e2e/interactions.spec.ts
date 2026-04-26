import { test, expect } from '@playwright/test'
import { loginAndWaitMap, tryOpenSlideOver } from '../utils/helpers'

test.describe('INTERAZIONI MAPPA E SLIDE-OVER (10 test)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndWaitMap(page)
  })

  test('4.1 — slide-over panel esiste nel DOM (chiuso di default)', async ({ page }) => {
    const panel = page.locator('[data-testid="tender-panel"]').first()
    await expect(panel).toBeAttached({ timeout: 5000 })
    const openState = await panel.getAttribute('data-open')
    expect(openState).toBe('false')
  })

  test('4.2 — click canvas non causa errori JS', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    const canvas = page.locator('.mapboxgl-canvas').first()
    const box = await canvas.boundingBox()
    if (box) {
      await canvas.click({ position: { x: box.width / 2, y: box.height / 2 }, force: true })
    }
    await page.waitForTimeout(800)
    expect(errors).toHaveLength(0)
  })

  test('4.3 — click su puntino apre slide-over (o 0 match nel cluster)', async ({ page }) => {
    const opened = await tryOpenSlideOver(page)
    // Match are present (50 total), slide-over MUST open
    const matches = await page.request.get('/api/matches/2134')
    const data = await matches.json()
    if (data.length > 0) {
      expect(opened, 'Con 50 match nel DB, il click su un puntino deve aprire lo slide-over').toBe(true)
    }
  })

  test('4.4 — slide-over aperto mostra nome buyer non vuoto', async ({ page }) => {
    const opened = await tryOpenSlideOver(page)
    if (!opened) return // skip if no markers hit
    const panel = page.locator('[data-testid="tender-panel"]').first()
    const h2 = panel.locator('h2, [class*="font-semibold"]').first()
    await expect(h2).toBeVisible({ timeout: 5000 })
    const text = await h2.textContent()
    expect(text?.trim().length).toBeGreaterThan(3)
  })

  test('4.5 — slide-over aperto mostra pattern importo "€"', async ({ page }) => {
    const opened = await tryOpenSlideOver(page)
    if (!opened) return
    const panel = page.locator('[data-testid="tender-panel"]').first()
    const panelText = await panel.textContent()
    expect(panelText).toMatch(/€/)
  })

  test('4.6 — slide-over aperto mostra score badge numerico', async ({ page }) => {
    const opened = await tryOpenSlideOver(page)
    if (!opened) return
    const panel = page.locator('[data-testid="tender-panel"]').first()
    const panelText = await panel.textContent()
    expect(panelText).toMatch(/Score\s*\d+/)
  })

  test('4.7 — slide-over aperto mostra etichetta priorità', async ({ page }) => {
    const opened = await tryOpenSlideOver(page)
    if (!opened) return
    const panel = page.locator('[data-testid="tender-panel"]').first()
    const panelText = await panel.textContent()
    expect(panelText).toMatch(/Alta priorità|Media|Bassa/)
  })

  test('4.8 — slide-over ha bottone link ANAC', async ({ page }) => {
    const opened = await tryOpenSlideOver(page)
    if (!opened) return
    const anacBtn = page.locator('[data-testid="tender-panel"] a, [data-testid="tender-panel"] button').filter({ hasText: /ANAC/i }).first()
    await expect(anacBtn).toBeVisible({ timeout: 5000 })
  })

  test('4.9 — click X chiude lo slide-over', async ({ page }) => {
    const opened = await tryOpenSlideOver(page)
    if (!opened) return
    // Trova il bottone X nel panel
    const closeBtn = page.locator('[data-testid="tender-panel"] button').first()
    await closeBtn.click()
    await page.waitForTimeout(400)
    const panel = page.locator('[data-testid="tender-panel"]')
    const openState = await panel.getAttribute('data-open')
    expect(openState).toBe('false')
  })

  test('4.10 — Escape key chiude lo slide-over', async ({ page }) => {
    const opened = await tryOpenSlideOver(page)
    if (!opened) return
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    const panel = page.locator('[data-testid="tender-panel"]')
    const openState = await panel.getAttribute('data-open')
    expect(openState).toBe('false')
  })

})
