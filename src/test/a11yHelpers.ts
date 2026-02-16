interface A11yViolation {
  element: string
  issue: string
}

/** Check for common accessibility violations in a container */
export function checkA11y(container: HTMLElement): A11yViolation[] {
  const violations: A11yViolation[] = []

  // Images without alt text
  container.querySelectorAll('img:not([alt])').forEach((el) => {
    violations.push({ element: el.outerHTML.slice(0, 80), issue: 'Image missing alt attribute' })
  })

  // Buttons without accessible name
  container.querySelectorAll('button').forEach((el) => {
    const name = el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('title')
    if (!name) {
      violations.push({ element: el.outerHTML.slice(0, 80), issue: 'Button missing accessible name' })
    }
  })

  // Form inputs without label
  container.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach((el) => {
    const id = el.getAttribute('id')
    const ariaLabel = el.getAttribute('aria-label')
    const ariaLabelledby = el.getAttribute('aria-labelledby')
    const hasLabel = id && container.querySelector(`label[for="${id}"]`)
    if (!hasLabel && !ariaLabel && !ariaLabelledby) {
      violations.push({ element: el.outerHTML.slice(0, 80), issue: 'Form input missing label' })
    }
  })

  // Links without text
  container.querySelectorAll('a').forEach((el) => {
    const name = el.textContent?.trim() || el.getAttribute('aria-label')
    if (!name) {
      violations.push({ element: el.outerHTML.slice(0, 80), issue: 'Link missing accessible name' })
    }
  })

  return violations
}
