import { useCallback } from 'react'
import { useLocalStorage } from '../lib/storage'
import { filterByMonthYear, sumExpenses, categoryTotalsForMonth, categoryBreakdown, prevMonthYear, computeDelta } from '../lib/calculations'
import type { Expense, Budgets, Category } from '../types'
import type { CategoryMeta } from '../types/category'

export function useExpenses(categories: CategoryMeta[], initialExpenses: Expense[]) {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('gastos-expenses', initialExpenses)

  const addExpense = useCallback((data: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [{ ...data, id: Date.now() }, ...prev])
  }, [setExpenses])

  const updateExpense = useCallback((id: number, data: Omit<Expense, 'id'>) => {
    setExpenses((prev) => prev.map((expense) => expense.id === id ? { ...data, id } : expense))
  }, [setExpenses])

  const deleteExpense = useCallback((id: number) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }, [setExpenses])

  const getExpensesForMonth = useCallback((month: number, year: number) => {
    return filterByMonthYear(expenses, month, year)
  }, [expenses])

  const getMonthTotal = useCallback((month: number, year: number) => {
    return sumExpenses(getExpensesForMonth(month, year))
  }, [getExpensesForMonth])

  const getCategoryTotals = useCallback((month: number, year: number) => {
    return categoryTotalsForMonth(getExpensesForMonth(month, year), categories)
  }, [categories, getExpensesForMonth])

  const getCategoryBreakdown = useCallback((month: number, year: number) => {
    return categoryBreakdown(getExpensesForMonth(month, year), categories)
  }, [categories, getExpensesForMonth])

  const getMonthDelta = useCallback((month: number, year: number) => {
    const total = getMonthTotal(month, year)
    const { month: prevM, year: prevY } = prevMonthYear(month, year)
    const prevTotal = getMonthTotal(prevM, prevY)
    return computeDelta(total, prevTotal)
  }, [getMonthTotal])

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesForMonth,
    getMonthTotal,
    getCategoryTotals,
    getCategoryBreakdown,
    getMonthDelta,
    setExpenses,
  }
}
