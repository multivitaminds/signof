import { test, expect } from '@playwright/test'

test.describe('Command Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.sidebar')
  })

  test('opens with Cmd+K and shows navigation commands', async ({ page }) => {
    await page.keyboard.press('Meta+k')

    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible({ timeout: 3000 })

    // Should show navigation commands
    await expect(dialog.locator('text=Go to Home')).toBeVisible()
    await expect(dialog.locator('text=Go to Documents')).toBeVisible()
  })

  test('> prefix filters to commands only', async ({ page }) => {
    await page.keyboard.press('Meta+k')

    const input = page.locator('.command-palette__input')
    await expect(input).toBeVisible({ timeout: 3000 })

    // Type > prefix to enter commands-only mode
    await input.fill('>theme')

    // Should show the toggle theme command
    await expect(page.locator('text=Toggle theme')).toBeVisible()
  })

  test('selecting a navigation command navigates to the route', async ({ page }) => {
    await page.keyboard.press('Meta+k')

    const input = page.locator('.command-palette__input')
    await expect(input).toBeVisible({ timeout: 3000 })

    // Search for Documents
    await input.fill('documents')

    // Click the navigation result
    const docsResult = page.locator('.command-palette__item', { hasText: 'Go to Documents' })
    await docsResult.click()

    // Should navigate to /documents
    await expect(page).toHaveURL('/documents')

    // Palette should be closed
    await expect(input).not.toBeVisible()
  })

  test('shows "No results" for non-matching query', async ({ page }) => {
    await page.keyboard.press('Meta+k')

    const input = page.locator('.command-palette__input')
    await expect(input).toBeVisible({ timeout: 3000 })

    await input.fill('xyznonexistentquery')

    await expect(page.locator('text=No results found')).toBeVisible()
  })

  test('keyboard navigation with arrow keys', async ({ page }) => {
    await page.keyboard.press('Meta+k')

    const input = page.locator('.command-palette__input')
    await expect(input).toBeVisible({ timeout: 3000 })

    // Press arrow down to highlight first item
    await page.keyboard.press('ArrowDown')

    // There should be an active item
    const activeItem = page.locator('.command-palette__item--active')
    await expect(activeItem).toBeVisible()
  })
})
