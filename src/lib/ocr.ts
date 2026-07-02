// Simple OCR helpers extracted for testability
export function extractAmount(text: string): number | null {
  if (!text) return null
  const m = text.match(/\$?\s?([0-9]+(?:\.[0-9]{1,2})?)/)
  if (!m) return null
  return Number(m[1])
}

export function extractMerchant(text: string): string | null {
  if (!text) return null
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  return lines[0] ?? null
}

export function detectCategory(text: string, categories: string[]): string | null {
  if (!text) return null
  const lower = text.toLowerCase()
  for (const c of categories) {
    if (lower.includes(c.toLowerCase())) return c
  }

  const keywordMap: Record<string, string[]> = {
    Transport: ['uber', 'taxi', 'bus', 'train', 'metro', 'uber'],
    Food: ['food', 'restaurant', 'lunch', 'dinner', 'cafe', 'coffee'],
    Utilities: ['electric', 'electricity', 'water', 'agua', 'gas', 'utility', 'utilities'],
  }

  for (const [cat, keys] of Object.entries(keywordMap)) {
    for (const k of keys) {
      if (lower.includes(k)) return cat
    }
  }

  return null
}

export async function runOCR(_file: File | string): Promise<string> {
  // trivial stub for testing; real implementation depends on tesseract
  return Promise.resolve('')
}
