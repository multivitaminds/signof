import { test, expect } from '@playwright/test'

test.describe('App Navigation', () => {
  test('sidebar links navigate to correct routes', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.sidebar')

    // Home is the default route
    await expect(page).toHaveURL('/')

    // Navigate to Pages
    await page.click('.sidebar__nav-link >> text=Pages')
    await expect(page).toHaveURL('/pages')

    // Navigate to Projects
    await page.click('.sidebar__nav-link >> text=Projects')
    await expect(page).toHaveURL('/projects')

    // Navigate to Documents
    await page.click('.sidebar__nav-link >> text=Documents')
    await expect(page).toHaveURL('/documents')

    // Navigate to Calendar (redirects to /calendar/events)
    await page.click('.sidebar__nav-link >> text=Calendar')
    await expect(page).toHaveURL(/\/calendar/)

    // Navigate to Databases
    await page.click('.sidebar__nav-link >> text=Databases')
    await expect(page).toHaveURL('/data')

    // Navigate back Home
    await page.click('.sidebar__nav-link >> text=Home')
    await expect(page).toHaveURL('/')
  })

  test('settings link in sidebar footer navigates to settings', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.sidebar')

    await page.click('.sidebar__footer .sidebar__nav-link >> text=Settings')
    await expect(page).toHaveURL(/\/settings/)
  })

  test('404 page renders for invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-route-xyz')

    // Should show the 404 page
    await expect(page.locator('.not-found__code')).toHaveText('404')
    await expect(page.locator('.not-found__title')).toHaveText('Page not found')

    // Should have a "Go Home" link
    const goHomeLink = page.locator('.not-found__btn--primary')
    await expect(goHomeLink).toBeVisible()
    await goHomeLink.click()
    await expect(page).toHaveURL('/')
  })

  test('Cmd+K opens command palette and Escape closes it', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.sidebar')

    // Open command palette with Cmd+K
    await page.keyboard.press('Meta+k')

    // The command palette should be visible
    const paletteInput = page.locator('.command-palette__input')
    await expect(paletteInput).toBeVisible({ timeout: 3000 })

    // Can type in the search input
    await paletteInput.fill('documents')
    await expect(paletteInput).toHaveValue('documents')

    // Close with Escape
    await page.keyboard.press('Escape')
    await expect(paletteInput).not.toBeVisible()
  })

  test('sidebar collapse/expand toggle works', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.sidebar')

    // Sidebar should be expanded by default
    await expect(page.locator('.sidebar--expanded')).toBeVisible()

    // Click the toggle button to collapse
    await page.click('.sidebar__toggle')
    await expect(page.locator('.sidebar--collapsed')).toBeVisible()

    // Click again to expand
    await page.click('.sidebar__toggle')
    await expect(page.locator('.sidebar--expanded')).toBeVisible()
  })

  test('keyboard shortcut [ toggles sidebar', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.sidebar--expanded')

    // Press [ to collapse
    await page.keyboard.press('[')
    await expect(page.locator('.sidebar--collapsed')).toBeVisible()

    // Press [ again to expand
    await page.keyboard.press('[')
    await expect(page.locator('.sidebar--expanded')).toBeVisible()
  })
})
