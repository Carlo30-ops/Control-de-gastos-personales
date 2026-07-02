import { extractAmount, extractMerchant, detectCategory } from './ocr'

test('extractAmount finds number with dollar', () => {
  expect(extractAmount('TOTAL $ 123.45')).toBe(123.45)
})

test('extractAmount returns null on empty', () => {
  expect(extractAmount('')).toBeNull()
})

test('extractMerchant returns first non-empty line', () => {
  const t = '\n\nACME Store\nItems...'
  expect(extractMerchant(t)).toBe('ACME Store')
})

test('detectCategory matches category by keyword', () => {
  const cats = ['Food', 'Transport', 'Utilities']
  expect(detectCategory('Paid at food court', cats)).toBe('Food')
  expect(detectCategory('Uber ride', cats)).toBe('Transport')
})
