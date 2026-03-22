'use client'

import { useState, useEffect } from 'react'
import { fleetRepository } from '@/lib/repositories/firebase/FirebaseFleetRepository'
import { FleetVehicle } from '@/types'

export function useFleet() {
  const [vehicles, setVehicles] = useState<Record<string, FleetVehicle>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = fleetRepository.subscribeToFleet((data) => {
      setVehicles(data)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const vehicleList = Object.values(vehicles)
  const onlineCount = vehicleList.filter(v => v.status !== 'OFFLINE').length
  const enRouteCount = vehicleList.filter(v => v.status === 'EN_ROUTE').length
  const idleCount = vehicleList.filter(v => v.status === 'IDLE').length

  return { vehicles, vehicleList, isLoading, onlineCount, enRouteCount, idleCount }
}
