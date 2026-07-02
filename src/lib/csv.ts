import type { Expense } from '../types'
import { todayStr } from './constants'

export function buildCSV(expenses: Expense[]): string {
  const header = 'Fecha,Categoría,Nota,Monto'
  const rows = expenses
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => `${e.date},${e.category},"${e.note}",${e.amount}`)
  return [header, ...rows].join('\n')
}

export function exportCSV(expenses: Expense[]) {
  const csv = buildCSV(expenses)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gastos-${todayStr}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
