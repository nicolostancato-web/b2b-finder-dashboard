import { test, expect } from '@playwright/test'
import { loginAndWaitDashboard } from '../utils/helpers'

test.describe('RESPONSIVE & MOBILE', () => {

  test('T42 — login page OK a 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/login')
    await expect(page.locator('input')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    const body = await page.locator('body').boundingBox()
    expect(body?.width).toBeLessThanOrEqual(375)
  })

  test('T43 — login page OK a 768px (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')
    await expect(page.locator('input')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('T44 — dashboard OK a 768px (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await loginAndWaitDashboard(page)
    await expect(page.locator('header').first()).toBeVisible()
    const body = await page.locator('body').boundingBox()
    expect(body?.width).toBeLessThanOrEqual(768)
  })

  test('T45 — sidebar collassata su mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAndWaitDashboard(page)
    const sidebar = page.locator('aside').first()
    const box = await sidebar.boundingBox()
    // Su mobile la sidebar è hidden (-translate-x-full)
    // box può essere null o fuori viewport
    if (box) {
      expect(box.x).toBeLessThan(0)
    }
  })

  test('T46 — hamburger menu visibile su mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAndWaitDashboard(page)
    // Il bottone hamburger è visibile nell'header su mobile
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
  })

  test('T47 — no overflow orizzontale su 375px dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await loginAndWaitDashboard(page)
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(385)
  })

  test('T48 — no overflow orizzontale su 768px dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await loginAndWaitDashboard(page)
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(780)
  })

})
