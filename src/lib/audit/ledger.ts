import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma/client'
import { AuditEntry } from '@/types'
import { IAuditRepository, CreateAuditEntryInput } from '@/lib/repositories/interfaces/IAuditRepository'

function computeHash(
  timestamp: string,
  actorId: string,
  action: string,
  previousHash: string
): string {
  return createHash('sha256')
    .update(`${timestamp}|${actorId}|${action}|${previousHash}`)
    .digest('hex')
}

function toAuditEntry(row: {
  id: string
  sequence: number
  actorId: string
  actorName: string
  actorRole: string
  action: string
  entityType: string
  entityId: string | null
  entityName: string | null
  metadata: unknown
  ipAddress: string | null
  hash: string
  previousHash: string
  timestamp: Date
}): AuditEntry {
  return {
    id: row.id,
    sequence: row.sequence,
    actorId: row.actorId,
    actorName: row.actorName,
    actorRole: row.actorRole,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId ?? undefined,
    entityName: row.entityName ?? undefined,
    metadata: row.metadata as Record<string, unknown> | undefined,
    ipAddress: row.ipAddress ?? undefined,
    hash: row.hash,
    previousHash: row.previousHash,
    timestamp: row.timestamp.toISOString(),
  }
}

export class AuditLedgerRepository implements IAuditRepository {
  async getEntries(limit = 50, offset = 0): Promise<AuditEntry[]> {
    const rows = await prisma.auditLedger.findMany({
      orderBy: { sequence: 'desc' },
      take: limit,
      skip: offset,
    })
    return rows.map(toAuditEntry)
  }

  async getEntriesByActor(actorId: string): Promise<AuditEntry[]> {
    const rows = await prisma.auditLedger.findMany({
      where: { actorId },
      orderBy: { sequence: 'desc' },
    })
    return rows.map(toAuditEntry)
  }

  async getEntriesByEntityType(entityType: string): Promise<AuditEntry[]> {
    const rows = await prisma.auditLedger.findMany({
      where: { entityType },
      orderBy: { sequence: 'desc' },
    })
    return rows.map(toAuditEntry)
  }

  async getLastEntry(): Promise<AuditEntry | null> {
    const row = await prisma.auditLedger.findFirst({ orderBy: { sequence: 'desc' } })
    return row ? toAuditEntry(row) : null
  }

  async getTotalCount(): Promise<number> {
    return prisma.auditLedger.count()
  }

  async createEntry(input: CreateAuditEntryInput): Promise<AuditEntry> {
    const lastEntry = await this.getLastEntry()
    const previousHash = lastEntry?.hash ?? createHash('sha256').update('GENESIS').digest('hex')
    const timestamp = new Date()
    const hash = computeHash(
      timestamp.toISOString(),
      input.actorId,
      input.action,
      previousHash
    )

    const row = await prisma.auditLedger.create({
      data: {
        actorId: input.actorId,
        actorName: input.actorName,
        actorRole: input.actorRole,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        metadata: input.metadata ?? {},
        ipAddress: input.ipAddress,
        hash,
        previousHash,
        timestamp,
      },
    })
    return toAuditEntry(row)
  }

  async verifyChain(): Promise<{ valid: boolean; brokenAt?: number }> {
    const entries = await prisma.auditLedger.findMany({
      orderBy: { sequence: 'asc' },
    })

    const genesisHash = createHash('sha256').update('GENESIS').digest('hex')

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const expectedPrevHash = i === 0 ? genesisHash : entries[i - 1].hash
      
      if (entry.previousHash !== expectedPrevHash) {
        return { valid: false, brokenAt: entry.sequence }
      }

      const expectedHash = computeHash(
        entry.timestamp.toISOString(),
        entry.actorId,
        entry.action,
        entry.previousHash
      )

      if (entry.hash !== expectedHash) {
        return { valid: false, brokenAt: entry.sequence }
      }
    }

    return { valid: true }
  }
}

export const auditLedger: IAuditRepository = new AuditLedgerRepository()

// Convenience function for use across the app
export async function logAuditEvent(input: CreateAuditEntryInput): Promise<void> {
  try {
    await auditLedger.createEntry(input)
  } catch (err) {
    console.error('[AuditLedger] Failed to log event:', err)
  }
}
