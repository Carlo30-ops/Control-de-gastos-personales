import { useCallback } from 'react'
import { useLocalStorage } from '../lib/storage'

export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage<boolean>('gastos-dark', false)
  const toggleDarkMode = useCallback(() => setIsDark((prev) => !prev), [setIsDark])
  return { isDark, setIsDark, toggleDarkMode }
}
