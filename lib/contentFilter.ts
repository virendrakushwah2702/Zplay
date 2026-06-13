const BLOCKED_TERMS = [
  // Adult content
  'porn','sex','nude','naked','xxx','adult','18+','erotic',
  'explicit','nsfw',
  // Violence
  'murder','kill','terrorist','bomb','weapon','gore',
  // Hate
  'hate','racist','slur',
  // Children safety
  'child abuse','minor',
]

export function containsBlockedContent(prompt: string): boolean {
  const lower = prompt.toLowerCase()
  return BLOCKED_TERMS.some(term => lower.includes(term))
}

export function sanitizePrompt(prompt: string): string {
  return prompt.trim().slice(0, 500)
}
