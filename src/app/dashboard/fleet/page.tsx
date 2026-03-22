'use client'

import { useState } from 'react'
import { useFleet } from '@/hooks/useFleet'
import { useTasks } from '@/hooks/useTasks'
import { fleetRepository } from '@/lib/repositories/firebase/FirebaseFleetRepository'
import { taskRepository } from '@/lib/repositories/firebase/FirebaseTaskRepository'
import { FleetVehicle, RealtimeTask } from '@/types'
import { Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Skeleton, useDisclosure, Progress } from '@nextui-org/react'
import { Truck, MapPin, Navigation, Zap } from 'lucide-react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'

const FleetMap = dynamic(() => import('@/components/fleet/FleetMap'), { ssr: false, loading: () => (
  <div className="h-full bg-[#0a0e1a] rounded-xl flex items-center justify-center">
    <div className="text-slate-500 text-sm">Loading map...</div>
  </div>
)})

const statusConfig = {
  EN_ROUTE: { label: 'En Route', color: 'success' as const },
  IDLE: { label: 'Idle', color: 'default' as const },
  LOADING: { label: 'Loading', color: 'primary' as const },
  MAINTENANCE: { label: 'Maintenance', color: 'warning' as const },
  OFFLINE: { label: 'Offline', color: 'danger' as const },
}

export default function FleetPage() {
  const { vehicleList, isLoading, onlineCount, enRouteCount, idleCount } = useFleet()
  const { taskList, pendingTasks } = useTasks()
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedTaskId) return
    setIsAssigning(true)
    try {
      await Promise.all([
        fleetRepository.assignVehicle(selectedVehicle.id, selectedTaskId),
        taskRepository.assignTask(selectedTaskId, selectedVehicle.id, selectedVehicle.driverName),
      ])
      toast.success(`${selectedVehicle.plateNumber} assigned to task`)
      onClose()
    } catch {
      toast.error('Assignment failed')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async (vehicle: FleetVehicle) => {
    try {
      await fleetRepository.unassignVehicle(vehicle.id)
      toast.success(`${vehicle.plateNumber} unassigned`)
    } catch {
      toast.error('Failed to unassign vehicle')
    }
  }

  const handleSeedData = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) toast.success('Demo data seeded!')
      else toast.error(data.error)
    } catch {
      toast.error('Seed failed')
    }
  }

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-[#00d4ff]" />
            <h1 className="text-xl font-bold text-white">Fleet Dispatcher</h1>
            <Chip size="sm" variant="flat" className="bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 font-mono text-[10px]">LIVE GPS</Chip>
          </div>
          <p className="text-sm text-slate-400">Automated vehicle assignment and tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#00ff88]">● {onlineCount} Online</span>
            <span className="text-[#00d4ff]">● {enRouteCount} En Route</span>
            <span className="text-slate-500">● {idleCount} Idle</span>
          </div>
          <Button size="sm" variant="flat" className="text-[#00d4ff] border-[#00d4ff]/20" onPress={handleSeedData}>
            Seed Demo Data
          </Button>
        </div>
      </div>

      {/* Main layout: Map + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Map */}
        <div className="lg:col-span-2 hal-card overflow-hidden" style={{ minHeight: '400px' }}>
          <FleetMap vehicles={vehicleList} onVehicleClick={(v) => { setSelectedVehicle(v); onOpen() }} />
        </div>

        {/* Vehicle List */}
        <div className="hal-card p-4 flex flex-col overflow-hidden">
          <h3 className="text-sm font-semibold text-white mb-3 flex-shrink-0">Active Fleet</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg bg-[#1e2d4a]" />
              ))
            ) : vehicleList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm mb-3">No fleet data loaded</p>
                <Button size="sm" variant="flat" className="text-[#00d4ff]" onPress={handleSeedData}>
                  Load Demo Data
                </Button>
              </div>
            ) : (
              vehicleList.map(vehicle => {
                const sc = statusConfig[vehicle.status]
                return (
                  <div
                    key={vehicle.id}
                    className="p-3 bg-[#060910] rounded-lg border border-[#1e2d4a] hover:border-[#00d4ff]/30 cursor-pointer transition-all"
                    onClick={() => { setSelectedVehicle(vehicle); onOpen() }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-white">{vehicle.plateNumber}</span>
                        <Chip size="sm" color={sc.color} variant="flat" className="text-[9px] h-4">{sc.label}</Chip>
                      </div>
                      {vehicle.speed > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-[#00d4ff] font-mono">
                          <Navigation className="w-3 h-3" />
                          {vehicle.speed} km/h
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{vehicle.model} • {vehicle.driverName}</p>
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-slate-500">Load</span>
                        <span className="text-[10px] font-mono text-slate-400">{vehicle.loadPercent}%</span>
                      </div>
                      <Progress
                        size="sm"
                        value={vehicle.loadPercent}
                        color={vehicle.loadPercent > 85 ? 'danger' : 'primary'}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} className="bg-[#0f1629] border border-[#1e2d4a]">
        <ModalContent>
          <ModalHeader className="text-white">
            {selectedVehicle?.plateNumber} — {selectedVehicle?.model}
          </ModalHeader>
          <ModalBody>
            {selectedVehicle && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#060910] rounded-lg border border-[#1e2d4a]">
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <Chip size="sm" color={statusConfig[selectedVehicle.status].color} variant="flat">
                      {statusConfig[selectedVehicle.status].label}
                    </Chip>
                  </div>
                  <div className="p-3 bg-[#060910] rounded-lg border border-[#1e2d4a]">
                    <p className="text-xs text-slate-500 mb-1">Driver</p>
                    <p className="text-sm text-white">{selectedVehicle.driverName}</p>
                  </div>
                  <div className="p-3 bg-[#060910] rounded-lg border border-[#1e2d4a]">
                    <p className="text-xs text-slate-500 mb-1">Position</p>
                    <p className="text-xs font-mono text-[#00d4ff]">
                      {selectedVehicle.lat.toFixed(4)}, {selectedVehicle.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="p-3 bg-[#060910] rounded-lg border border-[#1e2d4a]">
                    <p className="text-xs text-slate-500 mb-1">Load</p>
                    <p className="text-sm font-mono text-white">{selectedVehicle.loadPercent}%</p>
                  </div>
                </div>
                <Select
                  label="Assign to Pending Task"
                  placeholder="Select a task..."
                  selectedKeys={selectedTaskId ? [selectedTaskId] : []}
                  onSelectionChange={(keys) => setSelectedTaskId(Array.from(keys)[0] as string)}
                  classNames={{ trigger: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
                >
                  {pendingTasks.map(task => (
                    <SelectItem key={task.id} textValue={task.title}>
                      <div>
                        <p className="text-sm">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.priority} priority</p>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedVehicle?.status === 'EN_ROUTE' && (
              <Button
                variant="flat"
                color="warning"
                size="sm"
                onPress={() => { handleUnassign(selectedVehicle!); onClose() }}
              >
                Unassign
              </Button>
            )}
            <Button variant="flat" onPress={onClose} className="text-slate-400">Cancel</Button>
            <Button
              color="primary"
              onPress={handleAssign}
              isLoading={isAssigning}
              isDisabled={!selectedTaskId}
              className="bg-[#00d4ff] text-black"
            >
              Assign Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
