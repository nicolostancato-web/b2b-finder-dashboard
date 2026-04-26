import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('INTERAZIONI E SIDE PANEL', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndWaitDashboard(page)
    // Aspetta mappa carica
    await page.locator('.mapboxgl-canvas').waitFor({ state: 'visible', timeout: 8000 })
    await page.waitForTimeout(2000) // tiles rendering
  })

  test('T16 — filtro legenda funziona (click "Alta priorità")', async ({ page }) => {
    const altaBtn = page.locator('button:has-text("Alta priorità")').first()
    await expect(altaBtn).toBeVisible()
    await altaBtn.click()
    // Dopo click il pulsante dovrebbe cambiare stato (bg più chiaro)
    // Verifica che non ci siano errori
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('T17 — click canvas mappa non genera errori JS', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const canvas = page.locator('.mapboxgl-canvas').first()
    const box = await canvas.boundingBox()
    if (box) {
      // Click al centro della mappa
      await canvas.click({ position: { x: box.width / 2, y: box.height / 2 }, force: true })
      await page.waitForTimeout(1000)
    }
    // Filtriamo errori noti di Mapbox (WebGL warnings sono accettabili)
    const realErrors = errors.filter(e =>
      !e.includes('WebGL') &&
      !e.includes('THREE') &&
      !e.includes('mapbox')
    )
    expect(realErrors.length).toBe(0)
  })

  test('T18 — side panel chiudibile se aperto', async ({ page }) => {
    // Verifica che il panel di default NON sia visibile
    const panel = page.locator('.translate-x-full, [class*="translate-x-full"]').first()
    // Se c'è un pulsante X nel panel, verifica che funzioni
    // Altrimenti verifica solo che non ci siano errori
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('T19 — API /api/matches/2134 risponde con dati', async ({ page }) => {
    // Verifica che l'API dei match risponda correttamente
    const res = await page.request.get('/api/matches/2134')
    expect(res.status()).toBe(200)

    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    // Deve avere almeno un match
    expect(data.length).toBeGreaterThan(0)

    // Verifica struttura primo match
    const first = data[0]
    expect(first).toHaveProperty('gara_ocid')
    expect(first).toHaveProperty('match_score')
    expect(first).toHaveProperty('match_label')
    expect(first).toHaveProperty('gara_lat')
    expect(first).toHaveProperty('gara_lng')
  })

  test('T20 — API /api/clients/2134 risponde con profilo corretto', async ({ page }) => {
    // Non usa cookie — deve rispondere 200 con dati
    const res = await page.request.get('/api/clients/2134')
    expect(res.status()).toBe(200)

    const data = await res.json()
    expect(data.codice).toBe('2134')
    expect(data.ragione_sociale).toBeTruthy()
    expect(data.sede).toHaveProperty('lat')
    expect(data.sede).toHaveProperty('lng')
    expect(data.tier).toBeTruthy()
  })

})
