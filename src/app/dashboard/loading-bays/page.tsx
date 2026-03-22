'use client'

import { useBays } from '@/hooks/useBays'
import { bayRepository } from '@/lib/repositories/firebase/FirebaseBayRepository'
import { RealtimeBay, BayStatus } from '@/types'
import { Chip, Skeleton, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem, useDisclosure } from '@nextui-org/react'
import { MapPin, Zap, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const statusConfig: Record<BayStatus, { label: string; chipColor: 'success' | 'danger' | 'warning' | 'primary'; cellClass: string }> = {
  AVAILABLE: { label: 'Available', chipColor: 'success', cellClass: 'bay-cell available' },
  OCCUPIED: { label: 'Occupied', chipColor: 'danger', cellClass: 'bay-cell occupied' },
  MAINTENANCE: { label: 'Maintenance', chipColor: 'warning', cellClass: 'bay-cell maintenance' },
  RESERVED: { label: 'Reserved', chipColor: 'primary', cellClass: 'bay-cell reserved' },
}

export default function LoadingBaysPage() {
  const { bayList, isLoading, availableCount, occupiedCount, maintenanceCount } = useBays()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedBay, setSelectedBay] = useState<RealtimeBay | null>(null)
  const [newStatus, setNewStatus] = useState<BayStatus>('AVAILABLE')
  const [isUpdating, setIsUpdating] = useState(false)

  const zones = ['A', 'B', 'C']

  const handleBayClick = (bay: RealtimeBay) => {
    setSelectedBay(bay)
    setNewStatus(bay.status)
    onOpen()
  }

  const handleUpdateStatus = async () => {
    if (!selectedBay) return
    setIsUpdating(true)
    try {
      await bayRepository.updateBayStatus(selectedBay.id, newStatus, newStatus === 'AVAILABLE' ? null : selectedBay.occupiedBy)
      toast.success(`Bay ${selectedBay.bayNumber} updated to ${newStatus}`)
      onClose()
    } catch {
      toast.error('Failed to update bay status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-[#00d4ff]" />
            <h1 className="text-xl font-bold text-white">Loading Bay Grid</h1>
            <Chip size="sm" variant="flat" className="bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 font-mono text-[10px]">
              LIVE
            </Chip>
          </div>
          <p className="text-sm text-slate-400">Real-time dock occupancy management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#00ff88]">● {availableCount} Available</span>
            <span className="text-[#ff3366]">● {occupiedCount} Occupied</span>
            <span className="text-[#ffaa00]">● {maintenanceCount} Maintenance</span>
          </div>
        </div>
      </div>

      {/* Bay Grid by Zone */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg bg-[#1e2d4a]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {zones.map(zone => {
            const zoneBays = bayList.filter(b => b.zone === zone)
            if (zoneBays.length === 0) return null
            return (
              <div key={zone} className="hal-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#00d4ff]">{zone}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">Zone {zone}</h3>
                  <span className="text-xs text-slate-500">({zoneBays.length} bays)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {zoneBays.map(bay => {
                    const sc = statusConfig[bay.status]
                    return (
                      <Tooltip
                        key={bay.id}
                        content={
                          <div className="text-xs p-1">
                            <p className="font-bold">Bay {bay.bayNumber}</p>
                            <p>Status: {sc.label}</p>
                            {bay.occupiedBy && <p>Vehicle: {bay.occupiedBy}</p>}
                            {bay.currentLoad > 0 && <p>Load: {(bay.currentLoad / 1000).toFixed(1)}t</p>}
                          </div>
                        }
                      >
                        <div
                          className={sc.cellClass}
                          onClick={() => handleBayClick(bay)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-lg font-bold font-mono">{String(bay.bayNumber).padStart(2, '0')}</span>
                            <Chip size="sm" color={sc.chipColor} variant="flat" className="text-[9px] h-4">
                              {sc.label}
                            </Chip>
                          </div>
                          {bay.occupiedBy && (
                            <p className="text-[10px] font-mono opacity-70 truncate">{bay.occupiedBy}</p>
                          )}
                          {bay.currentLoad > 0 && (
                            <p className="text-[10px] opacity-60">
                              {(bay.currentLoad / 1000).toFixed(0)}t / {(bay.maxCapacity / 1000).toFixed(0)}t
                            </p>
                          )}
                          {bay.status === 'AVAILABLE' && (
                            <p className="text-[10px] opacity-40 mt-1">Click to assign</p>
                          )}
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bay Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} className="bg-[#0f1629] border border-[#1e2d4a]">
        <ModalContent>
          <ModalHeader className="text-white">
            Bay {selectedBay?.bayNumber} — Zone {selectedBay?.zone}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#060910] rounded-lg border border-[#1e2d4a]">
                  <p className="text-xs text-slate-500 mb-1">Current Status</p>
                  <Chip size="sm" color={selectedBay ? statusConfig[selectedBay.status].chipColor : 'default'} variant="flat">
                    {selectedBay?.status}
                  </Chip>
                </div>
                <div className="p-3 bg-[#060910] rounded-lg border border-[#1e2d4a]">
                  <p className="text-xs text-slate-500 mb-1">Capacity</p>
                  <p className="text-sm font-mono text-white">{selectedBay ? (selectedBay.maxCapacity / 1000).toFixed(0) : 0}t max</p>
                </div>
              </div>
              <Select
                label="Update Status"
                selectedKeys={[newStatus]}
                onSelectionChange={(keys) => setNewStatus(Array.from(keys)[0] as BayStatus)}
                classNames={{
                  trigger: 'bg-[#060910] border-[#1e2d4a]',
                  label: 'text-slate-400',
                }}
              >
                {(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'] as BayStatus[]).map(s => (
                  <SelectItem key={s}>{s}</SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose} className="text-slate-400">Cancel</Button>
            <Button
              color="primary"
              onPress={handleUpdateStatus}
              isLoading={isUpdating}
              className="bg-[#00d4ff] text-black"
            >
              Update Bay
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
