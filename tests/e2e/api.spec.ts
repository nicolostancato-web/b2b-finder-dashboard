import { test, expect } from '@playwright/test'

test.describe('DATI REALI — API (8 test)', () => {

  test('5.1 — /api/clients/2134 ritorna ragione_sociale "Larioelettra"', async ({ page }) => {
    const res = await page.request.get('/api/clients/2134')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.ragione_sociale).toContain('Larioelettra')
    expect(data.sede?.lat).toBeTruthy()
    expect(data.sede?.lng).toBeTruthy()
  })

  test('5.2 — /api/matches/2134 ritorna almeno 10 match', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    const res = await page.request.get('/api/matches/2134')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(10)
  })

  test('5.3 — ogni match ha gara_lat, gara_lng, match_score, match_label', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    const res = await page.request.get('/api/matches/2134')
    const data = await res.json() as any[]
    expect(data.length).toBeGreaterThan(0)
    for (const m of data.slice(0, 10)) {
      expect(typeof m.gara_lat).toBe('string') // comes as string from DB
      expect(typeof m.gara_lng).toBe('string')
      expect(typeof m.match_score).toBe('number')
      expect(['alta', 'media', 'bassa']).toContain(m.match_label)
    }
  })

  test('5.4 — /api/clients/9999 ritorna 401', async ({ page }) => {
    const res = await page.request.get('/api/clients/9999')
    expect(res.status()).toBe(401)
  })

  test('5.5 — /api/clients/5678 ritorna profilo valido', async ({ page }) => {
    const res = await page.request.get('/api/clients/5678')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.codice).toBe('5678')
    expect(data.ragione_sociale?.length).toBeGreaterThan(3)
  })

  test('5.6 — match score tra 60 e 100', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    const res = await page.request.get('/api/matches/2134')
    const data = await res.json() as any[]
    for (const m of data.slice(0, 5)) {
      expect(m.match_score).toBeGreaterThanOrEqual(60)
      expect(m.match_score).toBeLessThanOrEqual(100)
    }
  })

  test('5.7 — /api/auth/logout ritorna 200', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    const res = await page.request.post('/api/auth/logout')
    expect(res.status()).toBe(200)
  })

  test('5.8 — /api/matches/2134 richiede auth (blocca senza cookie)', async ({ page }) => {
    const res = await page.request.get('/api/matches/2134', { maxRedirects: 0 })
    expect([301, 302, 307, 308, 401]).toContain(res.status())
  })

})
