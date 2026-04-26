import type { Page } from '@playwright/test'

export const TEST_CODE = '2134'
export const TEST_CODE_2 = '5678'

export async function login(page: Page, code = TEST_CODE) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  const input = page.locator('input#code, input[placeholder*="2134"], input[type="text"]').first()
  await input.fill(code)

  const btn = page.locator('button[type="submit"]').first()
  await btn.click()
}

export async function loginAndWaitDashboard(page: Page, code = TEST_CODE) {
  await login(page, code)
  await page.waitForURL('**/dashboard', { timeout: 10_000 })
  // Aspetta che il layout sia renderizzato
  await page.waitForLoadState('domcontentloaded')
}

export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(err.message))
  return errors
}
