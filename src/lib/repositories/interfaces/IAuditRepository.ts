import { AuditEntry } from '@/types'

export interface CreateAuditEntryInput {
  actorId: string
  actorName: string
  actorRole: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

export interface IAuditRepository {
  getEntries(limit?: number, offset?: number): Promise<AuditEntry[]>
  getEntriesByActor(actorId: string): Promise<AuditEntry[]>
  getEntriesByEntityType(entityType: string): Promise<AuditEntry[]>
  createEntry(input: CreateAuditEntryInput): Promise<AuditEntry>
  getLastEntry(): Promise<AuditEntry | null>
  verifyChain(): Promise<{ valid: boolean; brokenAt?: number }>
  getTotalCount(): Promise<number>
}
