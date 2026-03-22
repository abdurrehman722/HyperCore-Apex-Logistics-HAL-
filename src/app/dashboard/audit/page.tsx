'use client'

import { useState, useEffect } from 'react'
import { AuditEntry } from '@/types'
import { Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Skeleton } from '@nextui-org/react'
import { ScrollText, Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [chainStatus, setChainStatus] = useState<{ valid: boolean; brokenAt?: number } | null>(null)
  const [total, setTotal] = useState(0)

  const fetchEntries = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/audit')
      const data = await res.json()
      if (data.success) {
        setEntries(data.data)
        setTotal(data.total ?? data.data.length)
      }
    } catch { toast.error('Failed to load audit ledger') }
    finally { setIsLoading(false) }
  }

  const verifyChain = async () => {
    setIsVerifying(true)
    try {
      const res = await fetch('/api/audit/verify', { method: 'POST' })
      const data = await res.json()
      setChainStatus(data.result)
      if (data.result.valid) {
        toast.success('Audit chain integrity verified ✓')
      } else {
        toast.error(`Chain broken at entry #${data.result.brokenAt}`)
      }
    } catch { toast.error('Verification failed') }
    finally { setIsVerifying(false) }
  }

  useEffect(() => { fetchEntries() }, [])

  const entityTypeColor: Record<string, 'primary' | 'warning' | 'danger' | 'success' | 'default'> = {
    USER: 'primary',
    SCHEMA: 'warning',
    VEHICLE: 'success',
    TASK: 'default',
    BAY: 'default',
    SYSTEM: 'danger',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScrollText className="w-5 h-5 text-[#00d4ff]" />
            <h1 className="text-xl font-bold text-white">Immutable Audit Ledger</h1>
            <Chip size="sm" variant="flat" className="bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 font-mono text-[10px]">
              SHA-256
            </Chip>
          </div>
          <p className="text-sm text-slate-400">Cryptographically chained event log • tamper-proof compliance trail</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="flat"
            onPress={fetchEntries}
            startContent={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-slate-400"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onPress={verifyChain}
            isLoading={isVerifying}
            startContent={<Shield className="w-3.5 h-3.5" />}
            className="bg-[#7c3aed] text-white"
          >
            Verify Chain
          </Button>
        </div>
      </div>

      {/* Chain Integrity Status */}
      {chainStatus && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          chainStatus.valid
            ? 'bg-[#00ff88]/5 border-[#00ff88]/20 text-[#00ff88]'
            : 'bg-[#ff3366]/5 border-[#ff3366]/20 text-[#ff3366]'
        }`}>
          {chainStatus.valid ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {chainStatus.valid ? 'Chain Integrity Verified' : 'Chain Integrity Compromised'}
            </p>
            <p className="text-xs opacity-70">
              {chainStatus.valid
                ? `All ${total} audit entries validated. SHA-256 hash chain intact.`
                : `Tamper detected at sequence #${chainStatus.brokenAt}. Investigate immediately.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="hal-card p-4">
          <p className="text-xs text-slate-500 font-mono uppercase mb-1">Total Entries</p>
          <p className="text-2xl font-bold font-mono text-white">{total}</p>
        </div>
        <div className="hal-card p-4">
          <p className="text-xs text-slate-500 font-mono uppercase mb-1">Algorithm</p>
          <p className="text-sm font-mono text-[#00d4ff]">SHA-256</p>
          <p className="text-xs text-slate-500">Hash chaining</p>
        </div>
        <div className="hal-card p-4">
          <p className="text-xs text-slate-500 font-mono uppercase mb-1">Compliance</p>
          <p className="text-sm font-mono text-[#00ff88]">INSERT-ONLY</p>
          <p className="text-xs text-slate-500">No mutations allowed</p>
        </div>
      </div>

      {/* Audit Table */}
      <div className="hal-card overflow-hidden">
        <Table
          aria-label="Audit Ledger"
          removeWrapper
          classNames={{
            th: 'bg-[#060910] text-slate-400 text-xs font-mono border-b border-[#1e2d4a]',
            td: 'border-b border-[#1e2d4a]/40 py-2',
            tr: 'hover:bg-[#060910]/40 transition-colors',
          }}
        >
          <TableHeader>
            <TableColumn>#</TableColumn>
            <TableColumn>TIMESTAMP</TableColumn>
            <TableColumn>ACTOR</TableColumn>
            <TableColumn>ACTION</TableColumn>
            <TableColumn>ENTITY</TableColumn>
            <TableColumn>HASH</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              <div className="py-10 text-slate-500 text-sm">
                No audit entries yet. Events will appear here as actions are performed.
              </div>
            }
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 rounded bg-[#1e2d4a]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              entries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <span className="text-xs font-mono text-slate-500">#{entry.sequence}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-mono text-slate-300">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-white">{entry.actorName}</p>
                      <Chip size="sm" color="default" variant="flat" className="font-mono text-[9px] h-4 mt-0.5">
                        {entry.actorRole.replace('_', ' ')}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-300">{entry.action}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Chip
                        size="sm"
                        color={entityTypeColor[entry.entityType] ?? 'default'}
                        variant="flat"
                        className="text-[9px] h-4"
                      >
                        {entry.entityType}
                      </Chip>
                      {entry.entityName && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{entry.entityName}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[#00ff88] flex-shrink-0" />
                      <span className="text-[10px] font-mono text-slate-600 truncate max-w-[100px]">
                        {entry.hash.slice(0, 12)}…
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
