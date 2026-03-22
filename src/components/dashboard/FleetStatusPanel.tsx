'use client'

import { FleetVehicle } from '@/types'
import { Truck, Zap, Clock, Wrench } from 'lucide-react'
import { Chip, Progress, Skeleton } from '@nextui-org/react'
import Link from 'next/link'

interface FleetStatusPanelProps {
  vehicles: FleetVehicle[]
  isLoading: boolean
}

const statusConfig = {
  EN_ROUTE: { label: 'En Route', color: 'success' as const, dot: '#00ff88' },
  IDLE: { label: 'Idle', color: 'default' as const, dot: '#64748b' },
  LOADING: { label: 'Loading', color: 'primary' as const, dot: '#00d4ff' },
  MAINTENANCE: { label: 'Maintenance', color: 'warning' as const, dot: '#ffaa00' },
  OFFLINE: { label: 'Offline', color: 'danger' as const, dot: '#ff3366' },
}

export function FleetStatusPanel({ vehicles, isLoading }: FleetStatusPanelProps) {
  return (
    <div className="hal-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Fleet Status</h3>
          <p className="text-xs text-slate-500">Live vehicle telemetry</p>
        </div>
        <Link href="/dashboard/fleet" className="text-xs text-[#00d4ff] hover:underline font-mono">
          Full Dispatcher →
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg bg-[#1e2d4a]" />
          ))
        ) : vehicles.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No fleet data. <Link href="/dashboard/fleet" className="text-[#00d4ff]">Seed data</Link>
          </div>
        ) : (
          vehicles.slice(0, 5).map((vehicle) => {
            const sc = statusConfig[vehicle.status]
            return (
              <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-[#060910] rounded-lg border border-[#1e2d4a]">
                <div className="w-8 h-8 rounded-lg bg-[#0f1629] border border-[#1e2d4a] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-white">{vehicle.plateNumber}</span>
                    <Chip size="sm" color={sc.color} variant="flat" className="text-[9px] h-4">
                      {sc.label}
                    </Chip>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{vehicle.model} • {vehicle.driverName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress
                      size="sm"
                      value={vehicle.loadPercent}
                      color={vehicle.loadPercent > 85 ? 'danger' : vehicle.loadPercent > 60 ? 'warning' : 'primary'}
                      className="max-w-24"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">{vehicle.loadPercent}% load</span>
                    {vehicle.speed > 0 && (
                      <span className="text-[10px] text-[#00d4ff] font-mono ml-auto">{vehicle.speed} km/h</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
