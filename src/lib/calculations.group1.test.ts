import { filterByMonthYear, sumExpenses, categoryTotalsForMonth } from './calculations'
import { CATEGORIES } from './constants'

const expenses = [
  { id: 1, amount: 100, category: 'comida', date: '2026-06-10', note: 'A' },
  { id: 2, amount: 200, category: 'transporte', date: '2026-06-11', note: 'B' },
  { id: 3, amount: 50, category: 'comida', date: '2026-07-01', note: 'C' },
]

test('filterByMonthYear filters correctly', () => {
  const june = filterByMonthYear(expenses as any, 5, 2026)
  expect(june.length).toBe(2)
  const july = filterByMonthYear(expenses as any, 6, 2026)
  expect(july.length).toBe(1)
})

test('sumExpenses sums and handles empty', () => {
  expect(sumExpenses(expenses as any)).toBe(350)
  expect(sumExpenses([])).toBe(0)
})

test('categoryTotalsForMonth computes sums and sorts', () => {
  const june = filterByMonthYear(expenses as any, 5, 2026)
  const totals = categoryTotalsForMonth(june as any, CATEGORIES as any)
  const comida = totals.find((t) => t.id === 'comida')!
  const transporte = totals.find((t) => t.id === 'transporte')!
  expect(comida.sum).toBe(100)
  expect(transporte.sum).toBe(200)
  expect(totals[0].sum).toBeGreaterThanOrEqual(totals[1].sum)
})
