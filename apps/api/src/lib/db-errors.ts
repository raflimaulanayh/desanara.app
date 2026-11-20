/**
 * Postgres unique violation (23505). drizzle-orm wraps driver errors in DrizzleQueryError and keeps
 * the original on `cause`, so both places are checked.
 */
export function isUniqueViolation(e: unknown): boolean {
  const code = (x: unknown) =>
    typeof x === 'object' && x !== null && 'code' in x ? (x as { code: unknown }).code : undefined
  if (code(e) === '23505') return true
  const cause =
    typeof e === 'object' && e !== null && 'cause' in e
      ? (e as { cause: unknown }).cause
      : undefined
  return code(cause) === '23505'
}
