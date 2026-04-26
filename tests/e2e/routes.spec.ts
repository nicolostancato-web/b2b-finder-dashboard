import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('ROUTES & NAVIGATION', () => {

  test('T26 — / redirect a /login (non auth)', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('T27 — /dashboard redirect a /login (non auth)', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('T28 — /dashboard/map redirect a /dashboard (auth)', async ({ page }) => {
    await loginAndWaitDashboard(page)
    await page.goto('/dashboard/map')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('T29 — /dashboard/map redirect a /login (non auth)', async ({ page }) => {
    await page.goto('/dashboard/map')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('T30 — sidebar "Dashboard" link attivo su /dashboard', async ({ page }) => {
    await loginAndWaitDashboard(page)
    const dashLink = page.locator('nav a[href="/dashboard"]').first()
    await expect(dashLink).toBeVisible()
    const cls = await dashLink.getAttribute('class')
    expect(cls).toContain('emerald')
  })

  test('T31 — sidebar "Mappa" link esiste e porta a /dashboard', async ({ page }) => {
    await loginAndWaitDashboard(page)
    const mapaLink = page.locator('nav a[href="/dashboard/map"]').first()
    await expect(mapaLink).toBeVisible()
    await mapaLink.click()
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('T32 — rotta inesistente /dashboard/xyz → /login (non auth)', async ({ page }) => {
    await page.goto('/dashboard/xyz')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('T33 — codice 9999 rimane su /login', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input').fill('9999')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(3000)
    expect(page.url()).toContain('/login')
    expect(page.url()).not.toContain('/dashboard')
  })

})
