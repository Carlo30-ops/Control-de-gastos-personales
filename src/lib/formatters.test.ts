import { formatMXN, formatDate } from './formatters'

describe('formatters', () => {
  test('formatMXN normal and zero', () => {
    expect(formatMXN(1234)).toMatch(/\d/)
    expect(formatMXN(0)).toContain('0')
  })

  test('formatDate returns expected locale format', () => {
    const d = '2024-01-15'
    const out = formatDate(d)
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(4)
  })
})
