import { test, expect } from '@playwright/test'

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding')
  })

  test('first step (Welcome) is visible with display name input', async ({ page }) => {
    // Should show the Welcome step
    await expect(page.locator('.onboarding__title', { hasText: 'Welcome to Orchestree' })).toBeVisible()

    // Should show "Step 1 of 8"
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 1 of 8')

    // Should have a display name input
    const nameInput = page.locator('#display-name')
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toHaveAttribute('placeholder', 'Your name')
  })

  test('can type a name and click Continue to progress', async ({ page }) => {
    // Type a display name
    const nameInput = page.locator('#display-name')
    await nameInput.fill('Test User')
    await expect(nameInput).toHaveValue('Test User')

    // The Continue button should be enabled
    const continueButton = page.locator('.onboarding__next')
    await expect(continueButton).toBeEnabled()
    await continueButton.click()

    // Should advance to step 2 (Workspace)
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 2 of 8', { timeout: 3000 })
    await expect(page.locator('.onboarding__title', { hasText: 'Name your workspace' })).toBeVisible()
  })

  test('progress indicators update as steps advance', async ({ page }) => {
    // Step 1: fill name
    await page.locator('#display-name').fill('Test User')

    // Initially, first segment should be filled
    const filledSegments = page.locator('.onboarding__segment--filled')
    await expect(filledSegments).toHaveCount(1)

    // Click Continue to go to step 2
    await page.locator('.onboarding__next').click()
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 2 of 8', { timeout: 3000 })

    // Now 2 segments should be filled
    await expect(filledSegments).toHaveCount(2)
  })

  test('Back button goes to previous step', async ({ page }) => {
    // Step 1: fill name and advance
    await page.locator('#display-name').fill('Test User')
    await page.locator('.onboarding__next').click()
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 2 of 8', { timeout: 3000 })

    // Click Back
    const backButton = page.locator('.onboarding__back')
    await expect(backButton).toBeVisible()
    await backButton.click()

    // Should go back to step 1
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 1 of 8', { timeout: 3000 })
    await expect(page.locator('.onboarding__title', { hasText: 'Welcome to Orchestree' })).toBeVisible()
  })

  test('Skip button appears on optional steps (Team Invitations and Appearance)', async ({ page }) => {
    // Navigate to step 6 (Team Invitations, index 5)
    // Step 1: Welcome - fill name
    await page.locator('#display-name').fill('Test User')
    await page.locator('.onboarding__next').click()
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 2 of 8', { timeout: 3000 })

    // Step 2: Workspace - fill name
    await page.locator('#workspace-name').fill('Test Workspace')
    await page.locator('.onboarding__next').click()
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 3 of 8', { timeout: 3000 })

    // Step 3: Role - select a role
    await page.locator('.onboarding__role-card', { hasText: 'Engineering' }).click()
    await page.locator('.onboarding__next').click()
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 4 of 8', { timeout: 3000 })

    // Step 4: Team Size - select a size
    await page.locator('.onboarding__size-card', { hasText: '2-5' }).click()
    await page.locator('.onboarding__next').click()
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 5 of 8', { timeout: 3000 })

    // Step 5: Use Cases - select one
    await page.locator('.onboarding__usecase-card', { hasText: 'Document Signing' }).click()
    await page.locator('.onboarding__next').click()
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 6 of 8', { timeout: 3000 })

    // Step 6: Team Invitations (optional) - Skip button should be visible
    const skipButton = page.locator('.onboarding__skip')
    await expect(skipButton).toBeVisible()
    await expect(page.locator('.onboarding__title', { hasText: 'Invite your team' })).toBeVisible()

    // Click Skip to advance
    await skipButton.click()
    await expect(page.locator('.onboarding__step-counter')).toHaveText('Step 7 of 8', { timeout: 3000 })

    // Step 7: Appearance (optional) - Skip button should be visible
    await expect(page.locator('.onboarding__skip')).toBeVisible()
    await expect(page.locator('.onboarding__title', { hasText: 'Choose your look' })).toBeVisible()
  })

  test('Continue button is disabled when required fields are empty', async ({ page }) => {
    // On step 1, clear the name input (should be empty by default)
    const nameInput = page.locator('#display-name')
    await nameInput.clear()

    // Continue button should be disabled
    const continueButton = page.locator('.onboarding__next')
    await expect(continueButton).toBeDisabled()

    // Type a name
    await nameInput.fill('Test User')

    // Continue should now be enabled
    await expect(continueButton).toBeEnabled()
  })
})
