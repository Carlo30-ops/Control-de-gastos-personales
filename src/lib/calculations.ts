import type { Expense } from '../types'
import type { CategoryMeta } from '../types/category'

export function filterByMonthYear(expenses: Expense[], month: number, year: number) {
  return expenses.filter((e) => {
    const d = new Date(e.date + 'T00:00:00')
    return d.getMonth() === month && d.getFullYear() === year
  })
}

export function sumExpenses(expenses: Expense[]) {
  return expenses.reduce((s, e) => s + e.amount, 0)
}

export function categoryTotalsForMonth(expenses: Expense[], categories: CategoryMeta[]) {
  const totals = categories.map((c) => ({
    ...c,
    sum: expenses.filter((e) => e.category === c.id).reduce((s, e) => s + e.amount, 0),
  }))
  return totals.sort((a, b) => b.sum - a.sum)
}

export function computeDelta(total: number, prevTotal: number): number | null {
  if (prevTotal > 0) return ((total - prevTotal) / prevTotal) * 100
  if (prevTotal === 0 && total > 0) return 100
  return null
}

export function categoryBreakdown(expenses: Expense[], categories: CategoryMeta[]) {
  const total = sumExpenses(expenses)
  const breakdown = categories.map((cat) => {
    const amount = expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + e.amount, 0)
    return { ...cat, amount, pct: total > 0 ? (amount / total) * 100 : 0 }
  }).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount)
  return breakdown
}

function getUniqueMonthKeys(expenses: Expense[]) {
  return Array.from(
    new Set(
      expenses.map((expense) => {
        const date = new Date(expense.date + 'T00:00:00')
        return `${date.getFullYear()}-${date.getMonth()}`
      }),
    ),
  )
}

function getCategoryMonthlyTotals(expenses: Expense[], category: string) {
  const monthKeys = getUniqueMonthKeys(expenses)
  const totals = Object.fromEntries(monthKeys.map((key) => [key, 0])) as Record<string, number>

  for (const expense of expenses) {
    if (expense.category !== category) continue
    const date = new Date(expense.date + 'T00:00:00')
    const key = `${date.getFullYear()}-${date.getMonth()}`
    totals[key] = (totals[key] ?? 0) + expense.amount
  }

  return Object.values(totals)
}

export function getCategoryAverage(expenses: Expense[], category: string) {
  const monthTotals = getCategoryMonthlyTotals(expenses, category)
  if (!monthTotals.length) return 0
  const sum = monthTotals.reduce((total, value) => total + value, 0)
  return sum / monthTotals.length
}

export function getCategoryMax(expenses: Expense[], category: string) {
  const monthTotals = getCategoryMonthlyTotals(expenses, category)
  if (!monthTotals.length) return 0
  return Math.max(...monthTotals)
}

export function getCategoryMin(expenses: Expense[], category: string) {
  const monthTotals = getCategoryMonthlyTotals(expenses, category)
  if (!monthTotals.length) return 0
  return Math.min(...monthTotals)
}

export function getTopCategoryFromBreakdown<T extends { id: string; amount: number }>(
  breakdown: T[],
  budgets: Partial<Record<string, number>>,
) {
  if (!breakdown.length) return null
  const topAmount = breakdown[0].amount
  const topCandidates = breakdown.filter((item) => item.amount === topAmount)
  if (topCandidates.length === 1) return topCandidates[0]

  const budgeted = topCandidates.filter((item) => budgets[item.id] != null)
  if (budgeted.length === 1) return budgeted[0]
  return topCandidates[0]
}

export function prevMonthYear(month: number, year: number) {
  if (month === 0) return { month: 11, year: year - 1 }
  return { month: month - 1, year }
}
