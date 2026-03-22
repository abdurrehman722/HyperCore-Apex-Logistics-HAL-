'use client'

import { RealtimeTask } from '@/types'
import { Chip, Skeleton } from '@nextui-org/react'
import { AlarmClock, Truck, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TaskFeedProps {
  tasks: RealtimeTask[]
  isLoading: boolean
}

const priorityConfig = {
  CRITICAL: { color: 'danger' as const, label: 'CRITICAL' },
  HIGH: { color: 'warning' as const, label: 'HIGH' },
  MEDIUM: { color: 'primary' as const, label: 'MED' },
  LOW: { color: 'default' as const, label: 'LOW' },
}

const typeIcon = {
  DELIVERY: Truck,
  PICKUP: Package,
  LOADING: Package,
  UNLOADING: Package,
  INSPECTION: AlarmClock,
}

export function TaskFeed({ tasks, isLoading }: TaskFeedProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const pOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return pOrder[a.priority] - pOrder[b.priority]
  })

  return (
    <div className="hal-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Task Feed</h3>
          <p className="text-xs text-slate-500">Live dispatch queue</p>
        </div>
        <div className="relative flex items-center">
          <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full mr-2" />
          <div className="absolute left-0 w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-ping opacity-75" />
          <span className="text-[10px] text-[#00ff88] font-mono">LIVE</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg bg-[#1e2d4a]" />
          ))
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">No active tasks</div>
        ) : (
          sortedTasks.map((task) => {
            const pc = priorityConfig[task.priority]
            const Icon = typeIcon[task.type] ?? Package
            return (
              <div key={task.id} className="p-3 bg-[#060910] rounded-lg border border-[#1e2d4a] hover:border-[#1e2d4a]/80 transition-colors">
                <div className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Chip size="sm" color={pc.color} variant="flat" className="text-[9px] h-4 px-1">{pc.label}</Chip>
                      {task.status === 'IN_PROGRESS' && (
                        <Chip size="sm" color="success" variant="dot" className="text-[9px] h-4 px-1">Active</Chip>
                      )}
                    </div>
                    <p className="text-xs text-white truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {task.assignedTo ?? 'Unassigned'} •{' '}
                      {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </p>
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
