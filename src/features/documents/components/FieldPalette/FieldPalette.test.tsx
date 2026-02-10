import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FieldPalette from './FieldPalette'

describe('FieldPalette', () => {
  it('renders all field type buttons', () => {
    render(<FieldPalette onFieldDragStart={vi.fn()} />)

    expect(screen.getByRole('button', { name: /Drag Signature field/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Drag Initials field/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Drag Date Signed field/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Drag Text field/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Drag Checkbox field/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Drag Dropdown field/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Drag Attachment field/i })).toBeInTheDocument()
  })

  it('renders toolbar role', () => {
    render(<FieldPalette onFieldDragStart={vi.fn()} />)
    expect(screen.getByRole('toolbar', { name: 'Field types' })).toBeInTheDocument()
  })

  it('disables all buttons when disabled prop is true', () => {
    render(<FieldPalette onFieldDragStart={vi.fn()} disabled />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('renders the Fields title', () => {
    render(<FieldPalette onFieldDragStart={vi.fn()} />)
    expect(screen.getByText('Fields')).toBeInTheDocument()
  })
})
