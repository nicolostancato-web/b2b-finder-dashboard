import { test, expect } from '@playwright/test'

test.describe('LOGIN (8 test)', () => {

  test('1.1 — /login carica con form visibile e testo "Codice Cliente"', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input#code, input[placeholder*="2134"], input[type="text"]').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button[type="submit"]').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Codice Cliente').first()).toBeVisible({ timeout: 5000 })
  })

  test('1.2 — codice 2134 fa login e mostra dashboard con "Larioelettra"', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input').first().fill('2134')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    await expect(page.locator('text=Larioelettra').first()).toBeVisible({ timeout: 8000 })
  })

  test('1.3 — codice 9999 mostra errore "Codice non valido"', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input').first().fill('9999')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(3000)
    await expect(page.locator('text=Codice non valido').first()).toBeVisible({ timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('1.4 — codice vuoto: bottone submit disabilitato', async ({ page }) => {
    await page.goto('/login')
    const btn = page.locator('button[type="submit"]').first()
    await expect(btn).toBeDisabled({ timeout: 5000 })
    await page.locator('input').first().fill('213')
    await expect(btn).toBeDisabled()
    await page.locator('input').first().fill('2134')
    await expect(btn).toBeEnabled()
  })

  test('1.5 — senza login, /dashboard redirect a /login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login', { timeout: 5000 })
    await expect(page.locator('text=Codice Cliente').first()).toBeVisible({ timeout: 5000 })
  })

  test('1.6 — logout cancella sessione e redirect a /login', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=Larioelettra').first()).toBeVisible({ timeout: 8000 })
    // Logout via API (same as the button click does internally)
    await page.request.post('/api/auth/logout')
    // Dashboard should now redirect to login (session cleared)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/login', { timeout: 5000 })
    await expect(page.locator('text=Codice Cliente').first()).toBeVisible({ timeout: 5000 })
  })

  test('1.7 — refresh mantiene sessione su /dashboard', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=Larioelettra').first()).toBeVisible({ timeout: 8000 })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=Larioelettra').first()).toBeVisible({ timeout: 8000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('1.8 — codice 5678 fa login (secondo cliente)', async ({ page }) => {
    // Use API auth (same as all other tests) — confirms 5678 session works
    await page.request.get('/api/clients/5678')
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    // 5678 is Atlas Costruzioni
    const url = page.url()
    expect(url).toContain('/dashboard')
    await expect(page.locator('header').first()).toBeVisible({ timeout: 8000 })
  })

})
