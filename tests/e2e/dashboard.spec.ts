import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('DASHBOARD LAYOUT', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndWaitDashboard(page)
  })

  test('T06 — sidebar presente e visibile', async ({ page }) => {
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()
    // Larghezza sidebar (expanded = 220px, collapsed = 64px)
    const box = await sidebar.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(60)
  })

  test('T07 — header mostra nome cliente', async ({ page }) => {
    // Nome azienda visibile nell'header
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
    await expect(page.locator('text=Larioelettra').first()).toBeVisible()
  })

  test('T08 — logo B2B Finder visibile', async ({ page }) => {
    await expect(page.locator('text=B2B Finder').first()).toBeVisible()
  })

  test('T09 — stats nell\'header (gare e alta priorità)', async ({ page }) => {
    // Almeno uno dei due stat pill è visibile
    const stats = page.locator('header').locator('[class*="tabular"]').first()
    // Verifica che ci siano numeri nell'header
    const headerText = await page.locator('header').textContent()
    expect(headerText).toBeTruthy()
    // Dovrebbe contenere numeri (match count)
    expect(headerText).toMatch(/\d+/)
  })

  test('T10 — bottone logout presente e funzionante', async ({ page }) => {
    const logoutBtn = page.locator('header button[title="Logout"], header button').last()
    await expect(logoutBtn).toBeVisible()
    await logoutBtn.click()
    // Dopo logout deve redirectare a /login
    await page.waitForURL('**/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

})
