import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocalStorage } from './storage'

function TestComp() {
  const [val, setVal] = useLocalStorage<string>('test-key', 'init')
  return (
    <div>
      <span data-testid="value">{val}</span>
      <button onClick={() => setVal('updated')}>update</button>
    </div>
  )
}

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  test('initial value and persistence', async () => {
    render(<TestComp />)
    expect(screen.getByTestId('value').textContent).toBe('init')
    await userEvent.click(screen.getByRole('button', { name: /update/i }))
    expect(screen.getByTestId('value').textContent).toBe('updated')
    expect(JSON.parse(localStorage.getItem('test-key') || 'null')).toBe('updated')
  })
})
