import { generateIdentifier } from '../issueIdentifier'

describe('generateIdentifier', () => {
  it('generates identifier from prefix and number', () => {
    expect(generateIdentifier('SO', 1)).toBe('SO-1')
  })

  it('handles multi-digit numbers', () => {
    expect(generateIdentifier('PROJ', 142)).toBe('PROJ-142')
  })

  it('handles single char prefix', () => {
    expect(generateIdentifier('X', 99)).toBe('X-99')
  })

  it('handles large numbers', () => {
    expect(generateIdentifier('MKT', 10000)).toBe('MKT-10000')
  })
})
