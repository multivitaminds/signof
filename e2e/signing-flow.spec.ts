import { test, expect } from '@playwright/test'

test.describe('Document Signing Flow', () => {
  test('sample documents are visible on the documents page', async ({ page }) => {
    await page.goto('/documents')

    // Sample documents from the store should be rendered
    await expect(page.locator('.document-card').first()).toBeVisible()

    // Check at least the Employment Agreement is present (has "Pending" status)
    await expect(page.locator('text=Employment Agreement - Jane Smith')).toBeVisible()
  })

  test('full signing ceremony flow - type signature', async ({ page }) => {
    await page.goto('/documents')

    // Find the pending document (Employment Agreement) and click Sign
    const pendingCard = page.locator('.document-card', {
      has: page.locator('text=Employment Agreement'),
    })
    await expect(pendingCard).toBeVisible()

    const signButton = pendingCard.locator('.document-card__btn--sign')
    await expect(signButton).toBeVisible()
    await signButton.click()

    // -- Review step --
    // The signing ceremony overlay should appear
    const ceremony = page.locator('.signing-ceremony-v2')
    await expect(ceremony).toBeVisible()

    // Should show the document name in the top bar
    await expect(ceremony.locator('.signing-ceremony-v2__doc-name')).toContainText('Employment Agreement')

    // Should show the signer name
    await expect(ceremony.locator('text=Jane Smith').first()).toBeVisible()

    // Check both consent checkboxes
    const checkboxes = ceremony.locator('.signing-ceremony-v2__review-checkbox input[type="checkbox"]')
    const firstCheckbox = checkboxes.nth(0)
    const secondCheckbox = checkboxes.nth(1)

    await firstCheckbox.check()
    await secondCheckbox.check()

    // Click Next
    const nextButton = ceremony.locator('.signing-ceremony-v2__btn-primary', { hasText: 'Next' })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    // -- Sign step --
    // Should show "Sign Document" heading
    await expect(ceremony.locator('h2', { hasText: 'Sign Document' })).toBeVisible()

    // Switch to Type tab
    const typeTab = ceremony.locator('button[role="tab"]', { hasText: 'Type' })
    await typeTab.click()

    // Type a signature
    const typeInput = ceremony.locator('.signing-ceremony-v2__type-input')
    await expect(typeInput).toBeVisible()
    await typeInput.fill('Jane Smith')

    // Click Finish Signing
    const finishButton = ceremony.locator('.signing-ceremony-v2__btn-primary', { hasText: 'Finish Signing' })
    await expect(finishButton).toBeEnabled()
    await finishButton.click()

    // -- Complete step --
    await expect(ceremony.locator('h2', { hasText: 'Document Signed Successfully' })).toBeVisible()

    // Click "Back to Documents"
    const backButton = ceremony.locator('button', { hasText: 'Back to Documents' })
    await backButton.click()

    // Ceremony should close
    await expect(ceremony).not.toBeVisible()
  })

  test('document deletion flow', async ({ page }) => {
    await page.goto('/documents')

    // Count initial documents
    const initialCount = await page.locator('.document-card').count()
    expect(initialCount).toBeGreaterThan(0)

    // Find the last document card (Contractor Invoice - Draft) and delete it
    const draftCard = page.locator('.document-card', {
      has: page.locator('text=Contractor Invoice'),
    })
    await expect(draftCard).toBeVisible()

    const deleteButton = draftCard.locator('.document-card__btn--delete')
    await deleteButton.click()

    // Document should be removed
    await expect(page.locator('.document-card')).toHaveCount(initialCount - 1)
    await expect(page.locator('text=Contractor Invoice')).not.toBeVisible()
  })

  test('document view modal', async ({ page }) => {
    await page.goto('/documents')

    // Click View on any document
    const firstCard = page.locator('.document-card').first()
    const viewButton = firstCard.locator('.document-card__btn--view')
    await viewButton.click()

    // A view modal should open with document details
    const modal = page.locator('.modal-overlay')
    await expect(modal).toBeVisible()

    // Should show status and created date
    await expect(modal.locator('.view-label', { hasText: 'Status' })).toBeVisible()
    await expect(modal.locator('.view-label', { hasText: 'Created' })).toBeVisible()

    // Close the modal
    await modal.locator('button', { hasText: 'Close' }).click()
    await expect(modal).not.toBeVisible()
  })
})
