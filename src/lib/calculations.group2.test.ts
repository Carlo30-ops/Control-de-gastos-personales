import { computeDelta, categoryBreakdown, prevMonthYear, getTopCategoryFromBreakdown } from './calculations'
import { CATEGORIES } from './constants'

test('computeDelta normal and prev zero', () => {
  expect(computeDelta(200, 100)).toBe(100)
  expect(computeDelta(50, 0)).toBe(100)
  expect(computeDelta(0, 0)).toBeNull()
})

test('categoryBreakdown single category and tie', () => {
  const expenses = [
    { id: 1, amount: 100, category: 'comida', date: '2026-06-10', note: '' },
  ]
  const breakdown = categoryBreakdown(expenses as any, CATEGORIES as any)
  expect(breakdown.length).toBe(1)
  expect(breakdown[0].pct).toBeCloseTo(100)

  const tieExpenses = [
    { id: 1, amount: 50, category: 'comida', date: '2026-06-10', note: '' },
    { id: 2, amount: 50, category: 'transporte', date: '2026-06-11', note: '' },
  ]
  const tie = categoryBreakdown(tieExpenses as any, CATEGORIES as any)
  expect(tie.length).toBe(2)
  expect(tie[0].amount).toBe(tie[1].amount)

  const budgets = { comida: 200 }
  const topWithBudget = getTopCategoryFromBreakdown(tie as any, budgets)
  expect(topWithBudget?.id).toBe('comida')

  const topWithoutBudgets = getTopCategoryFromBreakdown(tie as any, {})
  expect(topWithoutBudgets).toEqual(tie[0])
})

test('prevMonthYear rolls year correctly', () => {
  expect(prevMonthYear(0, 2026)).toEqual({ month: 11, year: 2025 })
  expect(prevMonthYear(5, 2026)).toEqual({ month: 4, year: 2026 })
})
