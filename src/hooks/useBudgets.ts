import { useCallback } from 'react'
import { useLocalStorage } from '../lib/storage'
import type { Budgets, Category } from '../types'

export function useBudgets() {
  const [budgets, setBudgets] = useLocalStorage<Budgets>('gastos-budgets', {})

  const updateBudget = useCallback((id: Category, value: number | null) => {
    setBudgets((prev) => {
      const next = { ...prev }
      if (value == null || value <= 0) {
        delete next[id]
      } else {
        next[id] = value
      }
      return next
    })
  }, [setBudgets])

  const clearBudgets = useCallback(() => setBudgets({}), [setBudgets])

  return { budgets, updateBudget, setBudgets, clearBudgets }
}
