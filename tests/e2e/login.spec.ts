import { test, expect } from '@playwright/test'
import { login } from '../utils/helpers'

test.describe('LOGIN FLOW', () => {

  test('T01 — pagina /login carica entro 3 secondi', async ({ page }) => {
    const t0 = Date.now()
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    const elapsed = Date.now() - t0
    expect(elapsed, `Login caricata in ${elapsed}ms`).toBeLessThan(3000)

    // Verifica elementi chiave
    await expect(page.locator('text=B2B Finder').first()).toBeVisible()
    await expect(page.locator('input')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('T02 — form accetta codice valido e reindirizza a dashboard', async ({ page }) => {
    await page.goto('/login')
    const input = page.locator('input').first()
    await input.fill('2134')
    await page.locator('button[type="submit"]').click()

    await page.waitForURL('**/dashboard', { timeout: 10_000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('T03 — codice cliente 2 (5678) funziona', async ({ page }) => {
    await page.goto('/login')
    const input = page.locator('input').first()
    await input.fill('5678')
    await page.locator('button[type="submit"]').click()

    await page.waitForURL('**/dashboard', { timeout: 10_000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('T04 — codice inesistente 9999 mostra errore', async ({ page }) => {
    await page.goto('/login')
    const input = page.locator('input').first()
    await input.fill('9999')
    await page.locator('button[type="submit"]').click()

    // Rimane su /login e mostra messaggio errore
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/dashboard')

    await expect(page.locator('text=Codice non valido')).toBeVisible({ timeout: 5000 })
  })

  test('T05 — bottone disabilitato con meno di 4 caratteri', async ({ page }) => {
    await page.goto('/login')
    const btn = page.locator('button[type="submit"]').first()

    // Inizialmente disabilitato (input vuoto)
    await expect(btn).toBeDisabled()

    // Con 3 caratteri ancora disabilitato
    await page.locator('input').first().fill('213')
    await expect(btn).toBeDisabled()

    // Con 4 caratteri abilitato
    await page.locator('input').first().fill('2134')
    await expect(btn).toBeEnabled()
  })

})
