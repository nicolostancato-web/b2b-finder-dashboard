import type { Page } from '@playwright/test'

export const TEST_CODE = '2134'
export const TEST_CODE_2 = '5678'

export async function login(page: Page, code = TEST_CODE) {
  await page.request.get(`/api/clients/${code}`)
}

export async function loginAndWaitDashboard(page: Page, code = TEST_CODE) {
  await login(page, code)
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
}

export async function loginAndWaitMap(page: Page, code = TEST_CODE) {
  await loginAndWaitDashboard(page, code)
  await page.locator('.mapboxgl-canvas').waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(3000)
}

export async function tryOpenSlideOver(page: Page): Promise<boolean> {
  const canvas = page.locator('.mapboxgl-canvas').first()
  if (!await canvas.isVisible()) return false

  // Primary: use programmatic test hook (most reliable)
  const opened = await page.evaluate(() => {
    const matches = (window as any).__testMatches
    const selectFn = (window as any).__testSelectMatch
    if (selectFn && matches && matches.length > 0) {
      selectFn(matches[0])
      return true
    }
    return false
  })
  if (opened) {
    await page.waitForTimeout(300)
    const panel = page.locator('[data-testid="tender-panel"][data-open="true"]')
    if (await panel.isVisible()) return true
  }

  // Fallback: canvas click
  const box = await canvas.boundingBox()
  if (!box) return false
  const positions = [
    { x: box.width * 0.5, y: box.height * 0.45 },
    { x: box.width * 0.4, y: box.height * 0.4 },
    { x: box.width * 0.6, y: box.height * 0.35 },
    { x: box.width * 0.55, y: box.height * 0.5 },
    { x: box.width * 0.45, y: box.height * 0.55 },
  ]
  for (const pos of positions) {
    await canvas.click({ position: pos, force: true })
    await page.waitForTimeout(500)
    const panel = page.locator('[data-testid="tender-panel"][data-open="true"]')
    if (await panel.isVisible()) return true
  }
  return false
}
