import { type Database, auditLogs } from '@repo/db'

/** A transaction handle (same query API as the database). */
export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0]
export type DbOrTx = Database | Tx

export interface AuditEntry {
  actorId: string
  villageId: string | null
  /** The permission action that was performed, e.g. "business.verify". */
  action: string
  entityType: string
  entityId: string
  changes?: unknown
  requestId?: string
}

/**
 * Writes one audit row. Call it inside the same transaction as the mutation
 * (docs/architecture/api-conventions.md) so a failed write leaves no orphan log.
 */
export async function writeAudit(tx: DbOrTx, entry: AuditEntry) {
  await tx.insert(auditLogs).values({ ...entry, changes: entry.changes ?? null })
}

/** Field-level diff `{ field: { from, to } }` for the audit log. Dates are compared by time. */
export function diffFields(
  before: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, { from: unknown; to: unknown }> {
  const norm = (v: unknown) => (v instanceof Date ? v.toISOString() : (v ?? null))
  const out: Record<string, { from: unknown; to: unknown }> = {}
  for (const [key, to] of Object.entries(patch)) {
    const from = norm(before[key])
    const next = norm(to)
    if (JSON.stringify(from) !== JSON.stringify(next)) out[key] = { from, to: next }
  }
  return out
}
