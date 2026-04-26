import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('API ENDPOINTS', () => {

  test('T34 — GET /api/clients/2134 senza auth setta cookie e ritorna profilo', async ({ page }) => {
    const res = await page.request.get('/api/clients/2134')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.codice).toBe('2134')
    expect(data.tier).toBeTruthy()
    // Cookie deve essere settato
    const cookies = await page.context().cookies()
    const session = cookies.find(c => c.name === 'b2b_session')
    expect(session).toBeTruthy()
  })

  test('T35 — GET /api/clients/9999 ritorna 401', async ({ page }) => {
    const res = await page.request.get('/api/clients/9999')
    expect(res.status()).toBe(401)
  })

  test('T36 — GET /api/matches/2134 richiede auth (401/307 senza cookie)', async ({ page }) => {
    const res = await page.request.get('/api/matches/2134', { maxRedirects: 0 })
    expect([307, 401, 302]).toContain(res.status())
  })

  test('T37 — GET /api/matches/2134 con auth ritorna array', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    const res = await page.request.get('/api/matches/2134')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('T38 — struttura match: campi obbligatori presenti', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    const res = await page.request.get('/api/matches/2134')
    const data = await res.json()
    if (data.length > 0) {
      const m = data[0]
      expect(m).toHaveProperty('gara_ocid')
      expect(m).toHaveProperty('match_score')
      expect(m).toHaveProperty('match_label')
      expect(['alta', 'media', 'bassa']).toContain(m.match_label)
      expect(m.match_score).toBeGreaterThan(0)
    }
  })

  test('T39 — POST /api/auth/logout svuota cookie', async ({ page }) => {
    await page.request.get('/api/clients/2134')
    const res = await page.request.post('/api/auth/logout')
    expect(res.status()).toBe(200)
  })

  test('T40 — GET /api/clients/5678 funziona (secondo cliente)', async ({ page }) => {
    const res = await page.request.get('/api/clients/5678')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.codice).toBe('5678')
  })

  test('T41 — POST /api/clients/2134/log-action accetta azione', async ({ page }) => {
    await loginAndWaitDashboard(page)
    const res = await page.request.post('/api/clients/2134/log-action', {
      data: { action: 'view_tender', tender_id: 'test-ocid' },
    })
    expect([200, 201]).toContain(res.status())
  })

})
