'use client'

import { useFleet } from '@/hooks/useFleet'
import { useBays } from '@/hooks/useBays'
import { useTasks } from '@/hooks/useTasks'
import { StatCard } from './StatCard'
import { BayGridMini } from './BayGridMini'
import { TaskFeed } from './TaskFeed'
import { FleetStatusPanel } from './FleetStatusPanel'
import { OperationsChart } from './OperationsChart'
import { Truck, MapPin, ClipboardList, AlertTriangle, Zap } from 'lucide-react'
import { Chip } from '@nextui-org/react'
import { useState, useEffect } from 'react'

interface CommandCenterProps {
  userRole: string
}

export function CommandCenter({ userRole }: CommandCenterProps) {
  const { vehicleList, isLoading: fleetLoading, onlineCount, enRouteCount, idleCount } = useFleet()
  const { bayList, isLoading: baysLoading, availableCount, occupiedCount } = useBays()
  const { taskList, isLoading: tasksLoading, activeTasks, pendingTasks, criticalTasks } = useTasks()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const isLoading = fleetLoading || baysLoading || tasksLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-[#00d4ff]" />
            <h1 className="text-xl font-bold text-white">Command Center</h1>
            <Chip size="sm" variant="flat" className="bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 font-mono text-[10px]">
              LIVE
            </Chip>
          </div>
          <p className="text-sm text-slate-400">Real-time operations overview</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 font-mono">
            {now?.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) ?? ''}
          </p>
          <p className="text-xs text-[#00d4ff] font-mono">
            {now ? `${now.toLocaleTimeString('en-AU', { hour12: false })} AEST` : ''}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fleet Online"
          value={isLoading ? '–' : `${onlineCount}/${vehicleList.length}`}
          subtitle={`${enRouteCount} en route • ${idleCount} idle`}
          icon={Truck}
          color="cyan"
          isLoading={fleetLoading}
        />
        <StatCard
          title="Bay Occupancy"
          value={isLoading ? '–' : `${occupiedCount}/${bayList.length}`}
          subtitle={`${availableCount} available`}
          icon={MapPin}
          color={occupiedCount > bayList.length * 0.8 ? 'danger' : 'green'}
          isLoading={baysLoading}
        />
        <StatCard
          title="Active Tasks"
          value={isLoading ? '–' : `${activeTasks.length}`}
          subtitle={`${pendingTasks.length} pending`}
          icon={ClipboardList}
          color="purple"
          isLoading={tasksLoading}
        />
        <StatCard
          title="Critical Alerts"
          value={isLoading ? '–' : `${criticalTasks.length}`}
          subtitle="Require immediate action"
          icon={AlertTriangle}
          color={criticalTasks.length > 0 ? 'danger' : 'green'}
          isLoading={tasksLoading}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: Fleet + Tasks */}
        <div className="xl:col-span-2 space-y-6">
          {/* Operations Chart */}
          <OperationsChart />

          {/* Fleet Status */}
          <FleetStatusPanel vehicles={vehicleList} isLoading={fleetLoading} />
        </div>

        {/* Right column: Bay Grid + Task Feed */}
        <div className="space-y-6">
          {/* Bay Grid Mini */}
          <BayGridMini bays={bayList} isLoading={baysLoading} />

          {/* Task Feed */}
          <TaskFeed tasks={taskList} isLoading={tasksLoading} />
        </div>
      </div>
    </div>
  )
}
