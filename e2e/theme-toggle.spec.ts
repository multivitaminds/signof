import { test, expect } from '@playwright/test'

test.describe('Theme & Appearance Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with default state
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('signof-appearance-storage'))
  })

  test('switch between System, Light, and Dark themes', async ({ page }) => {
    await page.goto('/settings/appearance')

    // Wait for the appearance settings to load
    await expect(page.locator('.appearance-settings__title')).toHaveText('Appearance')

    // The theme grid should have three cards: System, Light, Dark
    const themeCards = page.locator('.appearance-settings__theme-card')
    await expect(themeCards).toHaveCount(3)

    // Click Light theme - use the label text within the card
    const lightCard = page.locator('.appearance-settings__theme-card').filter({ has: page.locator('.appearance-settings__theme-label', { hasText: 'Light' }) })
    await lightCard.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    // Click Dark theme
    const darkCard = page.locator('.appearance-settings__theme-card').filter({ has: page.locator('.appearance-settings__theme-label', { hasText: 'Dark' }) })
    await darkCard.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // Click System theme (resolves to light or dark depending on OS)
    const systemCard = page.locator('.appearance-settings__theme-card').filter({ has: page.locator('.appearance-settings__theme-label', { hasText: 'System' }) })
    await systemCard.click()
    const dataTheme = await page.locator('html').getAttribute('data-theme')
    expect(['light', 'dark']).toContain(dataTheme)
  })

  test('accent color change updates CSS variable', async ({ page }) => {
    await page.goto('/settings/appearance')
    await expect(page.locator('.appearance-settings__title')).toHaveText('Appearance')

    // Click the Blue accent color swatch
    const blueSwatch = page.locator('.appearance-settings__color-swatch[title="Blue"]')
    await blueSwatch.click()

    // Verify the CSS variable changed to the Blue value (#2563EB)
    const primaryColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    )
    expect(primaryColor).toBe('#2563EB')
  })

  test('theme persists across page reload', async ({ page }) => {
    await page.goto('/settings/appearance')
    await expect(page.locator('.appearance-settings__title')).toHaveText('Appearance')

    // Set to Dark theme
    const darkCard = page.locator('.appearance-settings__theme-card').filter({ has: page.locator('.appearance-settings__theme-label', { hasText: 'Dark' }) })
    await darkCard.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // Reload the page
    await page.reload()
    await expect(page.locator('.appearance-settings__title')).toHaveText('Appearance')

    // Theme should still be dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // Verify the Dark card is still marked as active
    const darkCardAfterReload = page.locator('.appearance-settings__theme-card').filter({ has: page.locator('.appearance-settings__theme-label', { hasText: 'Dark' }) })
    await expect(darkCardAfterReload).toHaveAttribute('aria-pressed', 'true')
  })

  test('theme is stored in localStorage', async ({ page }) => {
    await page.goto('/settings/appearance')
    await expect(page.locator('.appearance-settings__title')).toHaveText('Appearance')

    // Set to Light theme
    const lightCard = page.locator('.appearance-settings__theme-card').filter({ has: page.locator('.appearance-settings__theme-label', { hasText: 'Light' }) })
    await lightCard.click()

    // Wait a moment for Zustand to persist
    await page.waitForTimeout(500)

    // Check localStorage
    const stored = await page.evaluate(() =>
      localStorage.getItem('signof-appearance-storage')
    )
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    // Zustand persist stores state in a nested structure
    expect(parsed.state?.theme ?? parsed.theme).toBe('light')
  })
})
