import { parseCsv } from './csvParser'

describe('parseCsv', () => {
  it('parses simple CSV', () => {
    const result = parseCsv('name,email\nAlice,alice@test.com\nBob,bob@test.com')
    expect(result.headers).toEqual(['name', 'email'])
    expect(result.rows).toEqual([
      ['Alice', 'alice@test.com'],
      ['Bob', 'bob@test.com'],
    ])
    expect(result.totalRows).toBe(2)
    expect(result.errors).toEqual([])
  })

  it('handles quoted fields with commas', () => {
    const result = parseCsv('name,address\nAlice,"123 Main St, Apt 4"\nBob,"456 Oak Ave, Suite 5"')
    expect(result.rows[0]).toEqual(['Alice', '123 Main St, Apt 4'])
    expect(result.rows[1]).toEqual(['Bob', '456 Oak Ave, Suite 5'])
  })

  it('handles escaped quotes', () => {
    const result = parseCsv('name,quote\nAlice,"she said ""hello"""\nBob,"a ""test"" value"')
    expect(result.rows[0]).toEqual(['Alice', 'she said "hello"'])
    expect(result.rows[1]).toEqual(['Bob', 'a "test" value'])
  })

  it('handles CRLF line endings', () => {
    const result = parseCsv('name,email\r\nAlice,alice@test.com\r\nBob,bob@test.com\r\n')
    expect(result.headers).toEqual(['name', 'email'])
    expect(result.rows).toEqual([
      ['Alice', 'alice@test.com'],
      ['Bob', 'bob@test.com'],
    ])
  })

  it('handles CR-only line endings', () => {
    const result = parseCsv('name,email\rAlice,alice@test.com\rBob,bob@test.com')
    expect(result.headers).toEqual(['name', 'email'])
    expect(result.rows).toEqual([
      ['Alice', 'alice@test.com'],
      ['Bob', 'bob@test.com'],
    ])
  })

  it('skips empty rows', () => {
    const result = parseCsv('name,email\n\nAlice,alice@test.com\n\nBob,bob@test.com\n\n')
    expect(result.rows).toEqual([
      ['Alice', 'alice@test.com'],
      ['Bob', 'bob@test.com'],
    ])
    expect(result.totalRows).toBe(2)
  })

  it('respects maxRows option', () => {
    const result = parseCsv(
      'name,email\nAlice,a@t.com\nBob,b@t.com\nCharlie,c@t.com',
      { maxRows: 2 },
    )
    expect(result.rows).toHaveLength(2)
    expect(result.totalRows).toBe(3)
    expect(result.rows[0]![0]).toBe('Alice')
    expect(result.rows[1]![0]).toBe('Bob')
  })

  it('trims values by default', () => {
    const result = parseCsv('name , email \n  Alice  ,  alice@test.com  ')
    expect(result.headers).toEqual(['name', 'email'])
    expect(result.rows[0]).toEqual(['Alice', 'alice@test.com'])
  })

  it('preserves whitespace when trimValues is false', () => {
    const result = parseCsv('name , email \n  Alice  ,  alice@test.com  ', { trimValues: false })
    expect(result.headers).toEqual(['name ', ' email '])
    expect(result.rows[0]).toEqual(['  Alice  ', '  alice@test.com  '])
  })

  it('works without headers', () => {
    const result = parseCsv('Alice,alice@test.com\nBob,bob@test.com', { hasHeaders: false })
    expect(result.headers).toEqual(['Column 1', 'Column 2'])
    expect(result.rows).toEqual([
      ['Alice', 'alice@test.com'],
      ['Bob', 'bob@test.com'],
    ])
  })

  it('uses custom delimiter', () => {
    const result = parseCsv('name\temail\nAlice\talice@test.com', { delimiter: '\t' })
    expect(result.headers).toEqual(['name', 'email'])
    expect(result.rows[0]).toEqual(['Alice', 'alice@test.com'])
  })

  it('reports errors for unclosed quotes', () => {
    const result = parseCsv('name,email\n"Alice,alice@test.com')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]!.message).toContain('Unclosed')
  })
})
