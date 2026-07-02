import { buildCSV } from './csv'

const sample = [
  { date: '2026-06-20', category: 'food', note: 'Lunch', amount: 120 } ,
  { date: '2026-06-21', category: 'transport', note: 'Taxi', amount: 60 },
]

test('buildCSV normal', () => {
  const csv = buildCSV(sample as any)
  expect(csv).toContain('Fecha,Categoría,Nota,Monto')
  expect(csv).toContain('2026-06-21,transport,"Taxi",60')
})

test('buildCSV empty', () => {
  const csv = buildCSV([])
  expect(csv.split('\n').length).toBe(1)
  expect(csv).toBe('Fecha,Categoría,Nota,Monto')
})
