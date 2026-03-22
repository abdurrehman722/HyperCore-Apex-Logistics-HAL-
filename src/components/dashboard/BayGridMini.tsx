'use client'

import { RealtimeBay } from '@/types'
import { Skeleton } from '@nextui-org/react'
import Link from 'next/link'

interface BayGridMiniProps {
  bays: RealtimeBay[]
  isLoading: boolean
}

const statusStyles = {
  AVAILABLE: 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]',
  OCCUPIED: 'bg-[#ff3366]/10 border-[#ff3366]/30 text-[#ff3366]',
  MAINTENANCE: 'bg-[#ffaa00]/10 border-[#ffaa00]/30 text-[#ffaa00]',
  RESERVED: 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]',
}

export function BayGridMini({ bays, isLoading }: BayGridMiniProps) {
  const available = bays.filter(b => b.status === 'AVAILABLE').length
  const occupied = bays.filter(b => b.status === 'OCCUPIED').length

  return (
    <div className="hal-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Loading Bays</h3>
          <p className="text-xs text-slate-500">{available} available • {occupied} occupied</p>
        </div>
        <Link href="/dashboard/loading-bays" className="text-xs text-[#00d4ff] hover:underline font-mono">
          Full View →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded bg-[#1e2d4a]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1.5">
          {bays.map((bay) => (
            <div
              key={bay.id}
              className={`border rounded-md p-1.5 text-center transition-all duration-200 ${statusStyles[bay.status]}`}
            >
              <p className="text-[10px] font-mono font-bold">{String(bay.bayNumber).padStart(2, '0')}</p>
              <p className="text-[8px] opacity-70">{bay.zone}</p>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1e2d4a]">
        {[
          { label: 'Available', color: '#00ff88' },
          { label: 'Occupied', color: '#ff3366' },
          { label: 'Maint.', color: '#ffaa00' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: l.color + '33', border: `1px solid ${l.color}55` }} />
            <span className="text-[9px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
