/** Honorifics people put in front of their name ("Pak Hendra", "Bu Ani"). */
const HONORIFICS = new Set([
  'pak',
  'bapak',
  'bu',
  'ibu',
  'mas',
  'mbak',
  'kang',
  'teh',
  'bang',
  'kak',
  'h.',
  'hj.',
])

/**
 * The name to greet with: "Pak Hendra" → "Pak Hendra", "Ani Suryani" → "Ani".
 * With an honorific the next word is kept too, so the greeting stays polite.
 */
export function greetingName(full: string): string {
  const words = full.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return full
  if (HONORIFICS.has(words[0]!.toLowerCase()) && words[1]) return `${words[0]} ${words[1]}`
  return words[0]!
}
